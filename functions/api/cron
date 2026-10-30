export async function onRequest(context){
  return handleCron(context);
}

export async function onScheduled(event, env, ctx){
  ctx.waitUntil(handleCron({env}));
}

async function handleCron(context){
  const env = context.env;
  const db = env.DB;
  const token = env.GITHUB_TOKEN;
  const repo = "ioxeu-net/Radar_BLOKinho";
  
  try{
    if(!db) throw new Error("DB not bound");
    
    // 1. Conta total
    const count = await db.prepare("SELECT COUNT(*) as total FROM ofertas_da_lojinha").first();
    
    // 2. Pega últimos 50 para gerar produtos.json
    const { results } = await db.prepare("SELECT id, loja, titulo, preco, link, origem, data_import, status, badge FROM ofertas_da_lojinha ORDER BY id DESC LIMIT 50").all();
    
    // 3. Se tiver token, commita no Git
    let gitStatus = "sem token";
    if(token){
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(results, null, 2))));
      // Pega sha atual
      let sha = null;
      try{
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/produtos.json`, {
          headers:{Authorization:`token ${token}`, "User-Agent":"radar-blokinho-cron"}
        });
        if(getRes.ok){
          const j = await getRes.json();
          sha = j.sha;
        }
      }catch(e){}
      
      const putBody = {
        message: `cron 8/8min OFERTAS DA LOJINHA - ${results.length} anuncios - ${new Date().toISOString()}`,
        content: content,
        sha: sha
      };
      
      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/produtos.json`, {
        method:"PUT",
        headers:{Authorization:`token ${token}`, "Content-Type":"application/json", "User-Agent":"radar-blokinho-cron"},
        body: JSON.stringify(putBody)
      });
      
      gitStatus = putRes.ok ? "commitado no Git" : `erro git ${putRes.status}`;
    }
    
    return new Response(JSON.stringify({
      ok:true,
      total: count?.total||0,
      retornados: results.length,
      git: gitStatus,
      cron:"*/8 * * * * - OFERTAS DA LOJINHA 4x4",
      origem:"zap-business-channel-0029VakWvg6BadmYSshQ2V1Q",
      timestamp: new Date().toISOString()
    }), {headers:{"Content-Type":"application/json"}});
    
  }catch(e){
    return new Response(JSON.stringify({ok:false, error:e.message}), {status:500, headers:{"Content-Type":"application/json"}});
  }
}
