// == WORKER STANDALONE - RADAR BLOKINHO ==
// Este arquivo DEVE estar na RAIZ do repositório do Worker

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ROTA 1: RECEBER DADOS DO TAMPERMONKEY
    if (pathname === '/api/achadinhos' && request.method === 'POST') {
      return await handleAchadinhos(request, env);
    }

    // ROTA 2: ENTREGAR OFERTAS PARA O SITE/PAINEL
    if (pathname === '/api/ofertas' && request.method === 'GET') {
      return await handleOfertas(env);
    }

    // ROTA 3: HEALTH CHECK
    if (pathname === '/') {
      return new Response(JSON.stringify({ status: 'ok', service: 'Radar Blokinho Worker' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ROTA PADRÃO: 404
    return new Response(JSON.stringify({ error: 'Rota não encontrada' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // CRON TRIGGER (LIMPEZA AUTOMÁTICA)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCron(env));
  }
};

// === FUNÇÃO 1: RECEBER E SALVAR OFERTAS ===
async function handleAchadinhos(request, env) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await request.json();
    const { plataforma, url_original, texto_bruto, imagem_url } = data;

    if (!plataforma || !url_original) {
      return new Response(JSON.stringify({ erro: "Dados incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // LIMPEZA E INJEÇÃO DE LINKS
    let linkFinal = url_original;
    const SHOPEE_LOJA = "https://collshp.com/lojinhashopofertas?view=storefront";
    const MAGALU_LOJA = "https://www.magazinevoce.com.br/magazinehdmicroloja";
    const ML_LOJA = "https://lista.mercadolivre.com.br/_CustId_ML202408011903400660";
    const AMAZON_TAG = "coloposte-20";

    try {
      const url = new URL(url_original);
      const domain = url.hostname.toLowerCase();
      const pathname = url.pathname;

      if (domain.includes('shopee') || domain.includes('shp.ee') || domain.includes('collshp')) {
        const match = pathname.match(/i\.(\d+)\.(\d+)/);
        linkFinal = match ? `${SHOPEE_LOJA.split('?')[0]}/i.${match[1]}.${match[2]}` : SHOPEE_LOJA;
      } else if (domain.includes('mercadolivre') || domain.includes('mlb.io') || domain.includes('meli.la')) {
        linkFinal = ML_LOJA;
      } else if (domain.includes('magazinevoce') || domain.includes('maga.lu')) {
        linkFinal = MAGALU_LOJA;
      } else if (domain.includes('amazon')) {
        url.searchParams.set('tag', AMAZON_TAG);
        linkFinal = url.toString();
      } else {
        url.search = '';
        linkFinal = url.toString();
      }
    } catch (e) {
      console.error("Erro ao processar URL:", e);
    }

    // SALVAR NO BANCO
    if (plataforma === "mercado_livre") {
      await env.DB.prepare(
        "INSERT INTO mercado_livre (url_original, texto_bruto, imagem_url, data_captura) VALUES (?, ?, ?, ?)"
      ).bind(linkFinal, texto_bruto || '', imagem_url || null, new Date().toISOString()).run();
    } else {
      await env.DB.prepare(
        "INSERT INTO achadinhos (plataforma, url_original, texto_bruto, imagem_url, data_captura) VALUES (?, ?, ?, ?, ?)"
      ).bind(plataforma, linkFinal, texto_bruto || '', imagem_url || null, new Date().toISOString()).run();
    }

    return new Response(JSON.stringify({ status: "sucesso", mensagem: "Oferta salva!" }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Erro crítico:", err);
    return new Response(JSON.stringify({ erro: "Falha interna" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// === FUNÇÃO 2: ENTREGAR OFERTAS ===
async function handleOfertas(env) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    let allResults = [];

    // Busca em achadinhos
    try {
      const res1 = await env.DB.prepare(
        "SELECT id, plataforma, url_original as link, texto_bruto as titulo, imagem_url, data_captura FROM achadinhos ORDER BY data_captura DESC LIMIT 30"
      ).all();
      if (res1.results) allResults = allResults.concat(res1.results);
    } catch (e1) { console.error("Erro achadinhos:", e1); }

    // Busca em mercado_livre
    try {
      const res2 = await env.DB.prepare(
        "SELECT id, 'mercado_livre' as plataforma, url_original as link, texto_bruto as titulo, imagem_url, data_captura FROM mercado_livre ORDER BY data_captura DESC LIMIT 30"
      ).all();
      if (res2.results) allResults = allResults.concat(res2.results);
    } catch (e2) { console.error("Erro ML:", e2); }

    // Ordena e limita
    allResults.sort((a, b) => new Date(b.data_captura) - new Date(a.data_captura));
    const results = allResults.slice(0, 50);

    // Configurações de lojas
    const LOJAS = {
      shopee: "https://collshp.com/lojinhashopofertas?view=storefront",
      ml: "https://lista.mercadolivre.com.br/_CustId_ML202408011903400660",
      magalu: "https://www.magazinevoce.com.br/magazinehdmicroloja",
      amazon_tag: "coloposte-20"
    };

    const ofertas = results.map(item => {
      let link = item.link || "";
      let loja = (item.plataforma || "OUTROS").toUpperCase();

      if (loja.includes('SHOPEE')) {
        const m = link.match(/i\.(\d+)\.(\d+)/);
        link = m ? `${LOJAS.shopee.split('?')[0]}/i.${m[1]}.${m[2]}` : LOJAS.shopee;
        loja = 'SHOPEE';
      } else if (loja.includes('MERCADO') || loja.includes('ML')) {
        link = LOJAS.ml;
        loja = 'MERCADO LIVRE';
      } else if (loja.includes('MAGALU')) {
        link = LOJAS.magalu;
        loja = 'MAGALU';
      } else if (loja.includes('AMAZON')) {
        if (!link.includes('tag=')) link += (link.includes('?') ? '&' : '?') + `tag=${LOJAS.amazon_tag}`;
        loja = 'AMAZON';
      }

      return {
        id: item.id,
        loja,
        titulo: (item.titulo || "Oferta").substring(0, 100),
        link,
        imagem: item.imagem_url || null,
        preco: "Ver oferta"
      };
    });

    return new Response(JSON.stringify(ofertas), { headers: corsHeaders });

  } catch (err) {
    console.error("Erro geral:", err);
    return new Response(JSON.stringify([]), { status: 200, headers: corsHeaders });
  }
}

// === FUNÇÃO 3: CRON DE LIMPEZA ===
async function handleCron(env) {
  try {
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare("DELETE FROM achadinhos WHERE data_captura < ?").bind(seteDiasAtras).run();
    await env.DB.prepare("DELETE FROM mercado_livre WHERE data_captura < ?").bind(seteDiasAtras).run();
    console.log("Limpeza automática concluída");
  } catch (e) {
    console.error("Erro no cron:", e);
  }
}
