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
    const { plataforma, url_original, texto_bruto, imagem_url } = data;

    // Validação básica de segurança
    if (!plataforma || !url_original) {
      return new Response(JSON.stringify({ erro: "Dados incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // === LÓGICA DE LIMPEZA E INJEÇÃO (O CÉREBRO DO SISTEMA) ===
    let linkFinal = url_original;
    
    // Configurações Oficiais
    const SHOPEE_LOJA = "https://collshp.com/lojinhashopofertas?view=storefront";
    const MAGALU_LOJA = "https://www.magazinevoce.com.br/magazinehdmicroloja";
    const ML_LOJA = "https://lista.mercadolivre.com.br/_CustId_ML202408011903400660";
    const AMAZON_TAG = "coloposte-20";

    try {
      const url = new URL(url_original);
      const domain = url.hostname.toLowerCase();
      const pathname = url.pathname;

      // Shopee: Injeta na sua loja oficial mantendo o ID do produto
      if (domain.includes('shopee') || domain.includes('shp.ee') || domain.includes('collshp')) {
        const match = pathname.match(/i\.(\d+)\.(\d+)/);
        if (match) {
          linkFinal = `${SHOPEE_LOJA.split('?')[0]}/i.${match[1]}.${match[2]}`;
        } else {
          linkFinal = SHOPEE_LOJA;
        }
      } 
      // Mercado Livre: Força o link blindado do CustId
      else if (domain.includes('mercadolivre') || domain.includes('mlb.io') || domain.includes('meli.la')) {
        linkFinal = ML_LOJA;
      } 
      // Magalu: Link base da microloja
      else if (domain.includes('magazinevoce') || domain.includes('maga.lu')) {
        linkFinal = MAGALU_LOJA;
      } 
      // Amazon: Garante a tag de afiliado
      else if (domain.includes('amazon')) {
        url.searchParams.set('tag', AMAZON_TAG);
        linkFinal = url.toString();
      }
      // Outros (AliExpress, etc): Passa o link original limpo
      else {
        url.search = '';
        linkFinal = url.toString();
      }
    } catch (e) {
      console.error("Erro ao processar URL:", e);
      // Se der erro na URL, mantém o original para não perder o dado
      linkFinal = url_original; 
    }

    // === SALVAMENTO NO BANCO D1 ===
    // Salva na tabela correta baseada na plataforma
    if (plataforma === "mercado_livre") {
      await context.env.DB.prepare(
        "INSERT INTO mercado_livre (url_original, texto_bruto, imagem_url, data_captura) VALUES (?, ?, ?, ?)"
      ).bind(linkFinal, texto_bruto || '', imagem_url || null, new Date().toISOString()).run();
    } else {
      await context.env.DB.prepare(
        "INSERT INTO achadinhos (plataforma, url_original, texto_bruto, imagem_url, data_captura) VALUES (?, ?, ?, ?, ?)"
      ).bind(plataforma, linkFinal, texto_bruto || '', imagem_url || null, new Date().toISOString()).run();
    }

    return new Response(JSON.stringify({ status: "sucesso", mensagem: "Oferta salva e processada!" }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Erro crítico no Worker:", err);
    return new Response(JSON.stringify({ erro: "Falha interna no servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// Resposta para testes de conexão (CORS preflight)
export async function onRequestOptions() {
  return new Response(null, {
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}
