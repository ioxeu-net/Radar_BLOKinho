export async function onRequestPost(context){
  try{
    const db = context.env.DB;
    const body = await context.request.json();
    const { loja, titulo, preco, link, texto_bruto } = body;
    
    if(!link) return new Response(JSON.stringify({error:"link required"}), {status:400});
    
    // Evita duplicado nas últimas 24h
    const dup = await db.prepare("SELECT id FROM ofertas_da_lojinha WHERE link=? LIMIT 1").bind(link).first();
    if(dup){
      return new Response(JSON.stringify({ok:true, duplicado:true, id:dup.id}), {headers:{"Content-Type":"application/json"}});
    }
    
    const res = await db.prepare(
      "INSERT INTO ofertas_da_lojinha (loja, titulo, preco, link, plataforma, texto_bruto, origem, status, badge) VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo', 'OFERTA ZAP')"
    ).bind(loja||'MAGALU', titulo||'Sem titulo', preco||'Ver preço', link, 'tamper', texto_bruto||titulo, 'zap-business-channel-0029VakWvg6BadmYSshQ2V1Q').run();
    
    return new Response(JSON.stringify({ok:true, id:res.meta.last_row_id}), {headers:{"Content-Type":"application/json"}});
  }catch(e){
    return new Response(JSON.stringify({error:e.message}), {status:500});
  }
}

export async function onRequest(context){
  if(context.request.method==='POST') return onRequestPost(context);
  return new Response(JSON.stringify({ok:true, endpoint:"collect - Tamper -> D1"}), {headers:{"Content-Type":"application/json"}});
}

