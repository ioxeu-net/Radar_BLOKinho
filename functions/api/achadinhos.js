export async function onRequestPost(context) {
  // Configurações de cabeçalho CORS para o Tampermonkey conseguir enviar os dados
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Se receber um pacote de teste (OPTIONS), responde com sucesso na hora
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Coleta as informações enviadas pelo robô do WhatsApp Web
    const data = await context.request.json();
    const { plataforma, url_original, texto_bruto } = data;

    if (!plataforma || !url_original) {
      return new Response(JSON.stringify({ erro: "Campos obrigatórios ausentes" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Usa o binding 'DB' que você configurou com sucesso na tela do Cloudflare Pages
    await context.env.DB.prepare(
      "INSERT INTO achadinhos (plataforma, url_original, texto_bruto, data_captura) VALUES (?, ?, ?, ?)"
    ).bind(plataforma, url_original, texto_bruto, new Date().toISOString()).run();

    return new Response(JSON.stringify({ status: "sucesso", mensagem: "Gravado com sucesso no D1!" }), {
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

// Permite requisições de teste CORS também para o método OPTIONS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
