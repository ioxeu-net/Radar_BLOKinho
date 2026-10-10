let dadosLoja = {
  nome: "MINILOJA RELÂMPAGO",
  produtos: [
    { nome: "Jogo Gabinete RGB Mid Tower", link: "https://shopee.com.br" },
    { nome: "Kit Teclado + Mouse Gamer", link: "https://amazon.com.br" }
  ]
};

const API_URL = window.location.origin;

function mudarAba(alvo) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  
  const bloco = document.getElementById(`content-${alvo}`);
  const botao = document.getElementById(`btn-${alvo}`);
  if (bloco) bloco.classList.add('active');
  if (botao) botao.classList.add('active');
}

function renderizarCardsVitrine() {
  const box = document.getElementById('vitrine-produtos');
  if (!box) return;
  box.innerHTML = '';

  dadosLoja.produtos.forEach((prod, idx) => {
    const nomeLimpo = prod.nome.replace(/'/g, "\\'");
    box.innerHTML += `
      <div class="product-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge-off">-30% OFF</span>
          <span style="font-size:11px; color:#71717a;">Item #${idx+1}</span>
        </div>
        <h3 style="font-size:14px; font-weight:700; margin-top:8px;">${prod.nome}</h3>
        <p style="font-size:11px; color:#71717a; word-break:break-all; margin:4px 0 12px 0; font-family:monospace;">${prod.link}</p>
        <button style="width:100%; background-color:#7c3aed; color:white; border:none; padding:10px; border-radius:8px; font-weight:700; font-size:12px; margin-bottom:8px; cursor:pointer; text-transform:uppercase;" onclick="executarAnimacaoReels('${nomeLimpo}')">
          ⚡ Criar Reels (MônicaIA)
        </button>
        <button style="width:100%; background-color:#10b981; color:white; border:none; padding:12px; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;" onclick="window.open('${prod.link}', '_blank')">
          🟢 1 CLIQUE ZAP / COMPRAR
        </button>
      </div>
    `;
  });
}

function executarAnimacaoReels(nomeItem) {
  document.getElementById('target-product-name').innerText = nomeItem;
  document.getElementById('txt-status-player').innerHTML = `<span style="color:#bc95ff; font-weight:bold;">MônicaIA<br>Renderizando...</span>`;
  const pContainer = document.getElementById('p-container');
  const pFill = document.getElementById('p-fill');
  if (pContainer) pContainer.style.display = 'block';
  if (pFill) pFill.style.width = '0%';
  
  mudarAba('monica');

  let progresso = 0;
  const intervalo = setInterval(() => {
    progresso += 10;
    if (pFill) pFill.style.width = `${progresso}%`;
    if (progresso >= 100) {
      clearInterval(intervalo);
      document.getElementById('txt-status-player').innerHTML = `<span style="color:#4ade80; font-weight:bold;">🎬 Vídeo Ready 9:16<br>MônicaIA Finalizou!</span>`;
      if (pContainer) pContainer.style.display = 'none';
    }
  }, 120);
}

// 💛 LÓGICA DO GERADOR EXCLUSIVO MLB 1 (UNITÁRIO)
async function gerarLinkUnitario() {
  const url = document.getElementById('input-unitario').value.trim();
  if (!url) return;
  let urlLimpa = url.split('?')[0];

  await fetch(`${API_URL}/api/achadinhos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plataforma: "mercado_livre", url_original: urlLimpa, texto_bruto: "Manual Link Unitário" })
  });
  alert("Link higienizado e salvo na gaveta mercado_livre!");
  document.getElementById('input-unitario').value = '';
}

// 📦 LÓGICA DO GERADOR EXCLUSIVO MLB 2 (LOTES)
async function gerarLoteLinks() {
  const texto = document.getElementById('input-lote').value;
  if (!texto) return;
  const regex = /(https?:\/\/[^\s]+)/g;
  const links = texto.match(regex);
  let c = 0;

  if (links) {
    for (let l of links) {
      if (l.includes('mercadolivre.com') || l.includes('mlb.io') || l.includes('meli.la')) {
        let limpo = l.split('?')[0];
        c++;
        await fetch(`${API_URL}/api/achadinhos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plataforma: "mercado_livre", url_original: limpo, texto_bruto: "Manual Lote Extrator" })
        });
      }
    }
  }
  alert(`Importação em lote concluída! ${c} links salvos no D1.`);
  document.getElementById('input-lote').value = '';
}

// 📡 LEITOR DO BANCO D1 REAL DIRETO NO PAINEL ADMIN
async function carregarDadosD1DoPainel() {
  const logBox = document.getElementById('log-tabelas-painel');
  logBox.innerHTML = '<div style="color:#60a5fa; text-align:center; padding:10px;">Buscando dados no D1...</div>';
  
  try {
    const res = await fetch(`${API_URL}/api/achadinhos-ler`);
    if (!res.ok) throw new Error();
    const dados = await res.json();
    
    if(dados.length === 0) {
      logBox.innerHTML = '<div style="color:#71717a; text-align:center;">Nenhum produto capturado ainda.</div>';
      return;
    }
    
    logBox.innerHTML = '';
    dados.forEach(p => {
      const item = document.createElement('div');
      item.style.cssText = "background:#09090b; padding:8px; border-radius:6px; border-left:3px solid #10b981;";
      item.innerHTML = `<div style='display:flex; justify-content:space-between; font-size:10px; color:#71717a;'><span>${p.plataforma.toUpperCase()}</span><span>${new Date(p.data_captura).toLocaleTimeString('pt-BR')}</span></div><div style='color:#f4f4f5; margin-top:4px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>${p.texto_bruto || p.url_original}</div>`;
      logBox.appendChild(item);
    });
  } catch(e) {
    logBox.innerHTML = '<div style="color:#ef4444; text-align:center;">Erro ao conectar com o banco D1.</div>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  renderizarCardsVitrine();
});
