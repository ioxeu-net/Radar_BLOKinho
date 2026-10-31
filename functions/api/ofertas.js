export async function onRequest(context) {
  const corsHeaders = { 
    'Access-Control-Allow-Origin': '*', 
    'Content-Type': 'application/json' 
  };

  try {
    // 🔒 CONFIGURAÇÃO DE SEGURANÇA DUPLA PARA ML
    const ML_LINK_SEGURO = "https://lista.mercadolivre.com.br/_CustId_ML202408011903400660";
    const ML_LINK_PRINCIPAL = "https://meli.la/1T6tAuJ";
    
    // Usaremos o link seguro como padrão para garantir comissão
    const LOJAS_OFICIAIS = {
      shopee: "https://collshp.com/lojinhashopofertas?view=storefront",
      mercado_livre: ML_LINK_SEGURO, 
      magazine_luiza: "https://www.magazinevoce.com.br/magazinehdmicroloja",
      amazon_tag: "coloposte-20"
    };

    // ✅ BUSCA UNIFICADA: Pega dados das duas tabelas (ML separada + Achadinhos gerais)
    const stmt = context.env.DB.prepare(`
      SELECT id, 'mercado_livre' as plataforma, url_original as link, texto_bruto as titulo, imagem_url, data_captura FROM mercado_livre
      UNION ALL
      SELECT id, plataforma, url_original as link, texto_bruto as titulo, imagem_url, data_captura FROM achadinhos
      ORDER BY data_captura DESC LIMIT 60
    `);
    
    const { results } = await stmt.all();

    const ofertasFormatadas = results.map(item => {
      let linkFinal = item.link;
      let lojaNome = item.plataforma?.toUpperCase() || 'OFERTA';
      
      // Lógica de injeção de loja oficial (Backend Seguro)
      if (item.plataforma === 'shopee') {
        const match = item.link.match(/i\.(\d+)\.(\d+)/);
        if (match) {
          linkFinal = `https://collshp.com/lojinhashopofertas/i.${match[1]}.${match[2]}`;
        } else {
          linkFinal = LOJAS_OFICIAIS.shopee;
        }
        lojaNome = 'SHOPEE';
      } 
      else if (item.plataforma === 'mercado_livre') {
        // Força o uso do link seguro com seu CustId
        linkFinal = LOJAS_OFICIAIS.mercado_livre;
        lojaNome = 'MERCADO LIVRE';
      }
      else if (item.plataforma === 'magazine_luiza') {
        linkFinal = LOJAS_OFICIAIS.magazine_luiza;
        lojaNome = 'MAGALU';
      }
      else if (item.plataforma === 'amazon') {
        if (!linkFinal.includes('tag=')) {
          linkFinal += (linkFinal.includes('?') ? '&' : '?') + `tag=${LOJAS_OFICIAIS.amazon_tag}`;
        }
        lojaNome = 'AMAZON';
      }

      // Limpeza básica do título
      let tituloLimpo = item.titulo || "Oferta Imperdível";
      if (tituloLimpo.length > 100) tituloLimpo = tituloLimpo.substring(0, 97) + '...';

      return {
        id: item.id,
        loja: lojaNome,
        titulo: tituloLimpo,
        link: linkFinal,
        imagem: item.imagem_url || null,
        preco: "Ver oferta"
      };
    });

    return new Response(JSON.stringify(ofertasFormatadas), {
      headers: corsHeaders
    });

  } catch (err) {
    console.error("Erro ao buscar ofertas:", err);
    return new Response(JSON.stringify({ error: "Erro interno no servidor" }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
