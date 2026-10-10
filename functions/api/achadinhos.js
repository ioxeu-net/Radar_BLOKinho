export async function onRequestPost(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await context.request.json();
    const { plataforma, url_original, texto_bruto } = data;

    if (!plataforma || !url_original) {
      return new Response(JSON.stringify({ erro: "Campos obrigatórios ausentes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Grava de forma segura no banco de dados D1
    await context.env.DB.prepare(
      "INSERT INTO achadinhos (plataforma, url_original, texto_bruto, data_captura) VALUES (?, ?, ?, ?)"
    ).bind(plataforma, url_original, texto_bruto, new Date().toISOString()).run();

    // 2. Se o Token do Telegram estiver configurado, envia a oferta automaticamente para o bot
    if (context.env.TELEGRAM_TOKEN) {
      // Formata a mensagem com a identidade elegante do BLOKinho
      const mensagemTelegram = `🤖 *BLOKinho ACHEI ufaaa!!!* \n\n📝 ${texto_bruto || 'Confira esta oferta!'}\n\n🔗 *Link Promocional:* ${url_original}`;
      
      // Envia de forma autônoma para a API oficial do Telegram
      // IMPORTANTE: Substitua '@SEU_CANAL' pelo ID ou '@' do seu canal público do Telegram
      const canalDestino = "@SEU_CANAL"; 
      
      const telegramUrl = `https://telegram.org{context.env.TELEGRAM_TOKEN}/sendMessage`;
      
      // Executa o disparo em segundo plano sem travar a resposta do WhatsApp
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

    return new Response(JSON.stringify({ status: "sucesso", mensagem: "Gravado no D1 e enviado ao Telegram!" }), {
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
