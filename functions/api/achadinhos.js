/* 
============================================================
   ARQUIVO: functions/api/achadinhos.js
   FUNÇÃO: Receber dados do Robô e Salvar no Banco D1
   VERSÃO: Limpa (Sem Telegram) - v3.9.0
============================================================
*/

export async function onRequestPost(context) {
  
  // CABEÇALHO DE PERMISSÃO (CORS)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // SE FOR TESTE DE CONEXÃO, RESPONDE NA HORA
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    
    // >>> RECEBENDO OS DADOS DO ROBÔ <<<
    const data = await context.request.json();
    const { plataforma, url_original, texto_bruto, imagem_url } = data;

    // VALIDAÇÃO BÁSICA DE SEGURANÇA
    if (!plataforma || !url_original) {
      return new Response(JSON.stringify({ erro: "Dados incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // >>> SALVAMENTO AUTÔNOMO NO BANCO D1 <<<
    
    // 1. SE FOR MERCADO LIVRE: Salva na tabela exclusiva
    if (plataforma === "mercado_livre") {
      await context.env.DB.prepare(
        "INSERT INTO mercado_livre (url_original, texto_bruto, imagem_url, data_captura) VALUES (?, ?, ?, ?)"
      ).bind(url_original, texto_bruto, imagem_url || null, new Date().toISOString()).run();
    } 
    
    // 2. SE FOR OUTRA PLATAFORMA: Salva na tabela geral
    else {
      await context.env.DB.prepare(
        "INSERT INTO achadinhos (plataforma, url_original, texto_bruto, imagem_url, data_captura) VALUES (?, ?, ?, ?, ?)"
      ).bind(plataforma, url_original, texto_bruto, imagem_url || null, new Date().toISOString()).run();
    }

    // RESPOSTA DE SUCESSO PARA O ROBÔ
    return new Response(JSON.stringify({ status: "sucesso", mensagem: "Oferta salva!" }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    
    // TRATAMENTO DE ERRO SILÊNCIOSO
    console.error("Erro ao salvar oferta:", err);
    return new Response(JSON.stringify({ erro: "Falha interna" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// RESPOSTA PARA TESTES DE CONEXÃO
export async function onRequestOptions() {
  return new Response(null, {
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}
