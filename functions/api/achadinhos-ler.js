export async function onRequestGet(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    // Puxa os últimos 30 produtos capturados de forma decrescente (os mais novos primeiro)
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM achadinhos ORDER BY id DESC LIMIT 30"
    ).all();

    return new Response(JSON.stringify(results), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500, headers: corsHeaders });
  }
}
