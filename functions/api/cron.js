/* 
============================================================
   ARQUIVO: functions/cron.js (ou cron/index.js)
   FUNÇÃO: Manutenção Automática do Banco D1
   AGENDAMENTO: A cada 8 minutos (ou 1x dia para limpeza)
============================================================
*/

export async function onRequest(context) {
  return handleCron(context);
}

export async function onScheduled(event, env, ctx) {
  ctx.waitUntil(handleCron({ env }));
}

async function handleCron(context) {
  const env = context.env;
  const db = env.DB;
  
  try {
    if (!db) throw new Error("Banco D1 não conectado");

    // 1. LIMPEZA AUTOMÁTICA (Apaga ofertas com mais de 7 dias)
    // Isso evita que o banco fique pesado e caro
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    await db.prepare("DELETE FROM achadinhos WHERE data_captura < ?").bind(seteDiasAtras).run();
    await db.prepare("DELETE FROM mercado_livre WHERE data_captura < ?").bind(seteDiasAtras).run();

    // 2. CONTAGEM DE SAÚDE (Apenas para monitoramento)
    const totalAchadinhos = await db.prepare("SELECT COUNT(*) as total FROM achadinhos").first();
    const totalML = await db.prepare("SELECT COUNT(*) as total FROM mercado_livre").first();

    return new Response(JSON.stringify({
      ok: true,
      mensagem: "Manutenção concluída",
      limpeza: "Ofertas > 7 dias removidas",
      status_banco: {
        achadinhos_ativos: totalAchadinhos?.total || 0,
        ml_ativos: totalML?.total || 0
      },
      timestamp: new Date().toISOString()
    }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    });

  } catch (e) {
    console.error("Erro no Cron:", e);
    return new Response(JSON.stringify({ ok: false, error: e.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
}
