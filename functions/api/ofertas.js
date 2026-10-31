export async function onRequest(context) {
  const { env, request } = context;
  
  // Configuração de CORS para permitir acesso do frontend
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Busca os últimos 50 itens ordenados por data (mais recentes primeiro)
    const stmt = env.DB.prepare(
      "SELECT id, plataforma, url_original as link, texto_bruto as titulo, imagem_url FROM achadinhos ORDER BY id DESC LIMIT 50"
    );
    
    const { results } = await stmt.all();

    // Mapeamento das Lojas Oficiais para injeção direta no backend
    const LOJAS_OFICIAIS = {
      shopee: "https://collshp.com/lojinhashopofertas?view=storefront",
      mercado_livre: "https://meli.la/1T6tAuJ",
      magazine_luiza: "https://www.magazinevoce.com.br/magazinehdmicroloja",
      amazon_tag: "coloposte-20"
    };

    const ofertasFormatadas = results.map(item => {
      let linkFinal = item.link;
      let lojaNome = item.plataforma?.toUpperCase() || 'OFERTA';
      
      // Lógica de injeção de loja oficial (Backend)
      if (item.plataforma === 'shopee') {
        // Tenta extrair ID do produto para link direto na loja oficial
        const match = item.link.match(/i\.(\d+)\.(\d+)/);
        if (match) {
          linkFinal = `https://collshp.com/lojinhashopofertas/i.${match[1]}.${match[2]}`;
        } else {
          linkFinal = LOJAS_OFICIAIS.shopee;
        }
        lojaNome = 'SHOPEE';
      } 
      else if (item.plataforma === 'mercado_livre') {
        linkFinal = LOJAS_OFICIAIS.mercado_livre;
        lojaNome = 'MERCADO LIVRE';
      }
      else if (item.plataforma === 'magazine_luiza') {
        linkFinal = LOJAS_OFICIAIS.magazine_luiza;
        lojaNome = 'MAGALU';
      }
      else if (item.plataforma === 'amazon') {
        // Adiciona tag se não tiver
        if (!linkFinal.includes('tag=')) {
          linkFinal += (linkFinal.includes('?') ? '&' : '?') + `tag=${LOJAS_OFICIAIS.amazon_tag}`;
        }
        lojaNome = 'AMAZON';
      }

      // Limpeza básica do título (remove emojis excessivos ou textos muito longos)
      let tituloLimpo = item.titulo || "Oferta Imperdível";
      if (tituloLimpo.length > 100) tituloLimpo = tituloLimpo.substring(0, 97) + '...';

      return {
        id: item.id,
        loja: lojaNome,
        titulo: tituloLimpo,
        link: linkFinal, // Link já processado com loja oficial
        imagem: item.imagem_url || null, // Nova coluna de imagem
        preco: "Ver oferta" // Placeholder, pois o D1 não costuma ter preço exato salvo
      };
    });

    return new Response(JSON.stringify(ofertasFormatadas), {
      headers: corsHeaders
    });

  } catch (err) {
    console.error("Erro ao buscar ofertas:", err);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
