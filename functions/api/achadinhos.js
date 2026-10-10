export async function onRequestPost(context) {
  // Cabeçalhos CORS para permitir que o robô do WhatsApp Web envie os dados de fora
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Se receber um teste de conexão (OPTIONS), responde com sucesso na hora
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await context.request.json();
    const { plataforma, url_original, texto_bruto } = data;

    // Validação de segurança básica
    if (!plataforma || !url_original) {
      return new Response(JSON.stringify({ erro: "Campos obrigatórios ausentes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // DIVISÃO INTELIGENTE DE GAVETAS NO BANCO D1
    if (plataforma === "mercado_livre") {
      // Grava exclusivamente na tabela isolada do Mercado Livre
      await context.env.DB.prepare(
        "INSERT INTO mercado_livre (url_original, texto_bruto, data_captura) VALUES (?, ?, ?)"
      ).bind(url_original, texto_bruto, new Date().toISOString()).run();
    } else {
      // Mantém o fluxo tradicional na tabela de achadinhos (Shopee, Amazon, Magalu)
      await context.env.DB.prepare(
        "INSERT INTO achadinhos (plataforma, url_original, texto_bruto, data_captura) VALUES (?, ?, ?, ?)"
      ).bind(plataforma, url_original, texto_bruto, new Date().toISOString()).run();
    }

    // Se o Token do Telegram estiver ativo nas configurações do Cloudflare, faz o disparo
    if (context.env.TELEGRAM_TOKEN && plataforma !== "mercado_livre") {
      const mensagemTelegram = `🤖 *BLOKinho ACHEI ufaaa!!!* \n\n📝 ${texto_bruto || 'Confira esta oferta!'}\n\n🔗 *Link Promocional:* ${url_original}`;
      const canalDestino = "@SEU_CANAL"; // Se for usar o Telegram depois, troque aqui pelo seu @
      const telegramUrl = `https://telegram.org{context.env.TELEGRAM_TOKEN}/sendMessage`;
      
      context.waitUntil(
        fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: canalDestino,
            text: mensagemTelegram,
            parse_mode: "Markdown"
          })
        })
      );
    }

    return new Response(JSON.stringify({ status: "sucesso", mensagem: "Gravado na tabela correspondente!" }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
