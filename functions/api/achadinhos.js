export async function onRequest(context) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    // ✅ UNIÃO DAS DUAS TABELAS: Pega ML e Achadinhos juntos, ordenados por data
    const stmt = context.env.DB.prepare(`
      SELECT id, 'mercado_livre' as plataforma, url_original as link, texto_bruto as titulo, imagem_url, data_captura FROM mercado_livre
      UNION ALL
      SELECT id, plataforma, url_original as link, texto_bruto as titulo, imagem_url, data_captura FROM achadinhos
      ORDER BY data_captura DESC LIMIT 50
    `);
    
    const { results } = await stmt.all();

    // Configuração das Lojas Oficiais
    const LOJAS = {
      shopee: "https://collshp.com/lojinhashopofertas?view=storefront",
      mercado_livre: "https://meli.la/1T6tAuJ",
      magazine_luiza: "https://www.magazinevoce.com.br/magazinehdmicroloja",
      amazon_tag: "coloposte-20"
    };

    const ofertas = results.map(item => {
      let linkFinal = item.link;
      let lojaNome = item.plataforma?.toUpperCase() || 'OFERTA';

      // Lógica de injeção de loja oficial
      if (item.plataforma === 'shopee') {
        const match = item.link.match(/i\.(\d+)\.(\d+)/);
        linkFinal = match 
          ? `https://collshp.com/lojinhashopofertas/i.${match[1]}.${match[2]}` 
          : LOJAS.shopee;
        lojaNome = 'SHOPEE';
      } 
      else if (item.plataforma === 'mercado_livre') {
        linkFinal = LOJAS.mercado_livre;
        lojaNome = 'MERCADO LIVRE';
      }
      else if (item.plataforma === 'magazine_luiza') {
        linkFinal = LOJAS.magazine_luiza;
        lojaNome = 'MAGALU';
      }
      else if (item.plataforma === 'amazon') {
        linkFinal += (linkFinal.includes('?') ? '&' : '?') + `tag=${LOJAS.amazon_tag}`;
        lojaNome = 'AMAZON';
      }

      return {
        id: item.id,
        loja: lojaNome,
        titulo: (item.titulo || "Oferta").substring(0, 100),
        link: linkFinal,
        imagem: item.imagem_url || null, // ✅ IMAGEM AGORA VEM DO BANCO
        preco: "Ver oferta"
      };
    });

    return new Response(JSON.stringify(ofertas), { headers: corsHeaders });

  } catch (err) {
    console.error("Erro ofertas:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
