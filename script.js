// Dados fixos da vitrine para teste inicial e homologação do painel
let dadosLoja = {
  nome: "MINILOJA RELÂMPAGO",
  produtos: [
    { nome: "Jogo Gabinete RGB Mid Tower", link: "https://shopee.com.br" },
    { nome: "Kit Teclado + Mouse Gamer", link: "https://amazon.com.br" }
  ]
};

// Lógica de alternância de abas acionada via cliques do mouse (HTML inline onclick)
function mudarAba(alvo) {
  // Oculta todos os blocos de conteúdo e remove os estados ativos dos botões
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  // Ativa o bloco e o botão correspondente que recebeu o clique do mouse
  const blocoAlvo = document.getElementById(`content-${alvo}`);
  const botaoAlvo = document.getElementById(`btn-${alvo}`);
  
  if (blocoAlvo) blocoAlvo.classList.add('active');
  if (botaoAlvo) botaoAlvo.classList.add('active');
}

// Injeta os cards de produtos de forma dinâmica na interface estruturada em Tailwind
function renderizarCardsVitrine() {
  const box = document.getElementById('vitrine-produtos');
  if (!box) return;
  box.innerHTML = '';

  dadosLoja.produtos.forEach((prod, idx) => {
    // Saneamento básico de caracteres para evitar quebras sintáticas na string
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
          ⚡ Criar Reels deste Produto
        </button>
        
        <button style="width:100%; background-color:#10b981; color:white; border:none; padding:12px; border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;" onclick="window.open('${prod.link}', '_blank')">
          🟢 1 CLIQUE ZAP / COMPRAR
        </button>
      </div>
    `;
  });
}

// Lógica Inteligente de Transição de Abas com Feedback Visual de Progresso no Player 9:16
function executarAnimacaoReels(nomeItem) {
  // Alimenta os campos informativos na aba do estúdio MônicaIA
  document.getElementById('target-product-name').innerText = nomeItem;
  document.getElementById('txt-status-player').innerHTML = `<span style="color:#bc95ff; font-weight:bold;">MônicaIA<br>Iniciando Render...</span>`;
  
  const pContainer = document.getElementById('p-container');
  const pFill = document.getElementById('p-fill');
  
  // Exibe a barra de carregamento e zera seu preenchimento
  if (pContainer) pContainer.style.display = 'block';
  if (pFill) pFill.style.width = '0%';
  
  // Executa a transição automática de aba por script
  mudarAba('monica');

  let progresso = 0;
  const intervalo = setInterval(() => {
    progresso += 5;
    if (pFill) pFill.style.width = `${progresso}%`;
    
    if (progresso >= 100) {
      clearInterval(intervalo);
      document.getElementById('txt-status-player').innerHTML = `<span style="color:#4ade80; font-weight:bold;">🎬 Vídeo 9:16<br>Pronto para Exportar!</span>`;
      if (pContainer) pContainer.style.display = 'none';
    }
  }, 100);
}

// Inicializa a renderização assim que o script carregar completamente no navegador
window.addEventListener('DOMContentLoaded', () => {
  // Tenta ler o hash base64 gerado client-side se houver dados injetados
  try {
    const hash = window.location.hash;
    if (hash && hash.includes('dados=')) {
      const base64 = hash.split('dados=')[1];
      dadosLoja = JSON.parse(atob(base64));
      const lblNome = document.getElementById('lblNomeLoja');
      if (lblNome) lblNome.innerText = dadosLoja.nome.toUpperCase();
    }
  } catch (e) { 
    console.error("Aguardando entrada de hash client-side estruturado:", e); 
  }
  
  renderizarCardsVitrine();
});
