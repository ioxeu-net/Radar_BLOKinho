export async function onRequest(context) {
  const corsHeaders = { 
    'Access-Control-Allow-Origin': '*', 
    'Content-Type': 'application/json' 
  };

  try {
    // Configuração dos Links Oficiais
    const LOJAS_OFICIAIS = {
      shopee: "https://collshp.com/lojinhashopofertas?view=storefront",
      mercado_livre: "https://lista.mercadolivre.com.br/_CustId_ML202408011903400660",
      magazine_luiza: "https://www.magazinevoce.com.br/magazinehdmicroloja",
      amazon_tag: "coloposte-20"
    };

    let allResults = [];

    // 1. Busca na tabela ACHADINHOS
    try {
      const stmt1 = context.env.DB.prepare(
        "SELECT id, plataforma, url_original as link, texto_bruto as titulo, imagem_url, data_captura FROM achadinhos ORDER BY data_captura DESC LIMIT 30"
      );
      const res1 = await stmt1.all();
      if (res1.results) allResults = allResults.concat(res1.results);
    } catch (e1) {
      console.error("Erro ao ler achadinhos:", e1);
    }

    // 2. Busca na tabela MERCADO_LIVRE
    try {
      const stmt2 = context.env.DB.prepare(
        "SELECT id, 'mercado_livre' as plataforma, url_original as link, texto_bruto as titulo, imagem_url, data_captura FROM mercado_livre ORDER BY data_captura DESC LIMIT 30"
      );
      const res2 = await stmt2.all();
      if (res2.results) allResults = allResults.concat(res2.results);
    } catch (e2) {
      console.error("Erro ao ler mercado_livre:", e2);
    }

    // 3. Ordena tudo junto por data (mais recente primeiro)
    allResults.sort((a, b) => new Date(b.data_captura) - new Date(a.data_captura));
    
    // Pega apenas os 50 mais recentes no total
    const results = allResults.slice(0, 50);

    // 4. Processa e formata as ofertas
    const ofertasFormatadas = results.map(item => {
      let linkFinal = item.link || "";
      let lojaNome = (item.plataforma || "OUTROS").toUpperCase();
      
      // Lógica de Injeção de Links Segura
      if (lojaNome.includes('SHOPEE')) {
        const match = linkFinal.match(/i\.(\d+)\.(\d+)/);
        linkFinal = match ? `https://collshp.com/lojinhashopofertas/i.${match[1]}.${match[2]}` : LOJAS_OFICIAIS.shopee;
        lojaNome = 'SHOPEE';
      } 
      else if (lojaNome.includes('MERCADO') || lojaNome.includes('ML')) {
        linkFinal = LOJAS_OFICIAIS.mercado_livre;
        lojaNome = 'MERCADO LIVRE';
      }
      else if (lojaNome.includes('MAGALU') || lojaNome.includes('MAGAZINE')) {
        linkFinal = LOJAS_OFICIAIS.magazine_luiza;
        lojaNome = 'MAGALU';
      }
      else if (lojaNome.includes('AMAZON')) {
        if (!linkFinal.includes('tag=')) {
          linkFinal += (linkFinal.includes('?') ? '&' : '?') + `tag=${LOJAS_OFICIAIS.amazon_tag}`;
        }
        lojaNome = 'AMAZON';
      }

      return {
        id: item.id,
        loja: lojaNome,
        titulo: (item.titulo || "Oferta Imperdível").substring(0, 100),
        link: linkFinal,
        imagem: item.imagem_url || null,
        preco: "Ver oferta" // Placeholder pois o D1 não tem preço salvo ainda
      };
    });

    return new Response(JSON.stringify(ofertasFormatadas), { headers: corsHeaders });

  } catch (err) {
    console.error("ERRO CRÍTICO NA API OFERTAS:", err);
    // Retorna array vazio em vez de erro 500 para não travar o frontend
    return new Response(JSON.stringify([]), { 
      status: 200, 
      headers: corsHeaders 
    });
  }
}
