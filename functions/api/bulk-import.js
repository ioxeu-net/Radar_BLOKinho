export async function onRequestPost(context){
  try{
    const db = context.env.DB;
    const body = await context.request.json();
    const anuncios = body.anuncios || body || [];
    const lista = Array.isArray(anuncios) ? anuncios : [anuncios];
    
    let inseridos = 0;
    for(const a of lista.slice(0,200)){
      const link = a.link || a.url_original || '';
      if(!link) continue;
      const dup = await db.prepare("SELECT id FROM ofertas_da_lojinha WHERE link=? LIMIT 1").bind(link).first();
      if(dup) continue;
      
      await db.prepare(
        "INSERT INTO ofertas_da_lojinha (loja, titulo, preco, link, plataforma, texto_bruto, origem, status, badge) VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo', 'OFERTA ZAP')"
      ).bind(a.loja||'MAGALU', (a.titulo||'').slice(0,200), a.preco||'Ver preço', link, 'bulk-business', a.raw||a.titulo||'', 'zap-business-channel-0029VakWvg6BadmYSshQ2V1Q').run();
      inseridos++;
    }
    
    return new Response(JSON.stringify({ok:true, inseridos, total_recebido: lista.length}), {headers:{"Content-Type":"application/json"}});
  }catch(e){
    return new Response(JSON.stringify({error:e.message}), {status:500});
  }
}

export async function onRequest(context){
  if(context.request.method==='POST') return onRequestPost(context);
  return new Response(JSON.stringify({ok:true, endpoint:"bulk-import - Zap Business"}), {headers:{"Content-Type":"application/json"}});
}

