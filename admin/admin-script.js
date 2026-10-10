const API_URL = window.location.origin;

// VALIDAÇÃO DO PIN DE ACESSO
function validarAcessoAdmin() {
  const entrada = document.getElementById('txt-senha').value;
  if (entrada === "0660") {
    document.getElementById('caixa-autenticacao').style.display = 'none';
    document.getElementById('painel-privado').style.display = 'block';
    carregarDadosD1DoPainel();
  } else {
    alert("❌ PIN Incorreto! Acesso negado.");
    document.getElementById('txt-senha').value = '';
  }
}

function mudarAba(alvo) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`content-${alvo}`).classList.add('active');
  document.getElementById(`btn-${alvo}`).classList.add('active');
}

// 📻 SIMULADOR MUNDO RETRÔ
function gerarLayoutAnuncioRetro() {
  const nome = document.getElementById('retro-input-nome').value.trim();
  const preco = document.getElementById('retro-input-preco').value.trim();
  
  if (!nome) {
    alert("Por favor, digite o nome do produto!");
    return;
  }

  document.getElementById('retro-txt-titulo').innerText = nome.toUpperCase();
  document.getElementById('retro-txt-preco').innerText = preco ? preco : "Consulte a nossa banca";
  
  const copysVintage = [
    `"Distinção para a dona de casa! O formidável ${nome} chegou para trazer modernidade ao seu lar!"`,
    `"Economize minutos e garanta o contentamento com o sensacional ${nome}."`
  ];
  
  document.getElementById('retro-txt-copy').innerText = copysVintage[Math.floor(Math.random() * copysVintage.length)];
}

// GERADORES MANUAIS MERCADO LIVRE
async function gerarLinkUnitario() {
  const url = document.getElementById('input-unitario').value.trim();
  if (!url) return;
  let urlLimpa = url.split('?')[0];

  await fetch(`${API_URL}/api/achadinhos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plataforma: "mercado_livre", url_original: urlLimpa, texto_bruto: "Manual Unitário" })
  });
  alert("Link arquivado no D1!");
  document.getElementById('input-unitario').value = '';
  carregarDadosD1DoPainel();
}

// 📡 LEITOR DO BANCO D1 COM BOTÃO COMPARTILHAR/COPIAR REAL
async function carregarDadosD1DoPainel() {
  const logBox = document.getElementById('log-tabelas-painel');
  if (!logBox) return;
  logBox.innerHTML = '<div style="color:#60a5fa; text-align:center; padding:10px;">Lendo registros do D1...</div>';
  
  try {
    const res = await fetch(`${API_URL}/api/achadinhos-ler`);
    const dados = await res.json();
    
    if (dados.length === 0) {
      logBox.innerHTML = '<div style="color:#71717a; text-align:center; padding:10px;">Nenhum anúncio capturado ainda.</div>';
      return;
    }
    
    logBox.innerHTML = '';
    dados.forEach(p => {
      const item = document.createElement('div');
      item.style.cssText = "background:#09090b; padding:12px; border-radius:8px; border-left:3px solid #10b981; text-align:left; margin-bottom:8px; display:flex; flex-direction:column; gap:6px;";
      
      let tagCor = p.plataforma === "mercado_livre" ? "#eab308" : "#10b981";
      
      // Armazena o link de forma segura para a função de cópia
      const urlTratada = p.url_original.replace(/'/g, "\\'");
      
      item.innerHTML = `
        <div style='display:flex; justify-content:space-between; font-size:10px; font-weight:bold; color:${tagCor};'>
          <span>${p.plataforma.toUpperCase()}</span>
          <span style='color:#71717a;'>${new Date(p.data_captura).toLocaleTimeString('pt-BR')}</span>
        </div>
        <div style='color:#f4f4f5; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>
          ${p.texto_bruto || p.url_original}
        </div>
        <div style="display:flex; gap:6px; margin-top:4px;">
          <a href="${p.url_original}" target="_blank" style="background:#1e293b; color:#4ade80; padding:4px 8px; border-radius:4px; font-size:11px; text-decoration:none; font-weight:bold; text-align:center; flex:1;">🔗 Abrir Link</a>
          <button onclick="copiarLinkDireto('${urlTratada}')" style="background:#27272a; color:#fff; border:1px solid #3f3f46; padding:4px 8px; border-radius:4px; font-size:11px; cursor:pointer; font-weight:bold; flex:1;">📋 Copiar Link</button>
        </div>`;
      logBox.appendChild(item);
    });
  } catch(e) { 
    logBox.innerHTML = '<div style="color:#ef4444; text-align:center;">Erro ao ler tabelas Cloudflare.</div>'; 
  }
}

// Função executada pelo clique do mouse que joga o link direto na sua memória
function copiarLinkDireto(link) {
  navigator.clipboard.writeText(link);
  alert("Link copiado com sucesso! Pronto para colar no seu anúncio Retrô ou MônicaIA.");
}
