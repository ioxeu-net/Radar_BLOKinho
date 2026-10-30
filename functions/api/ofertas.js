export async function onRequest(context) {
  try {
    const db = context.env.DB;
    if(!db){
      return new Response(JSON.stringify({error:"DB not bound"}), {status:500, headers:{"Content-Type":"application/json"}});
    }
    // Pega 100 mais recentes da ofertas_da_lojinha
    const { results } = await db.prepare("SELECT id, loja, titulo, preco, link, badge, origem, data_import FROM ofertas_da_lojinha WHERE status='ativo' OR status IS NULL ORDER BY id DESC LIMIT 100").all();
    
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type":"application/json",
        "Access-Control-Allow-Origin":"*",
        "Cache-Control":"no-cache"
      }
    });
  } catch(e){
    return new Response(JSON.stringify({error:e.message}), {status:500, headers:{"Content-Type":"application/json"}});
  }
}
