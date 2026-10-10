// Endereço de gravação e leitura relativo da sua API do Cloudflare Pages
const API_URL = window.location.origin;

// Banco de dados simulado local enquanto o Cron do Workers alimenta o D1
let loteQuatroAnunciosFixos = [
  { nome: "Kit 12 Potes Herméticos Organizadores Premium", preco: "R\$ 49,90", link: "https://shopee.com.br", plataforma: "shopee" },
  { nome: "Batedeira Planetária Turbo Industrial de Alta Performance", preco: "R\$ 389,00", link: "https://amazon.com.br", plataforma: "amazon" },
  { nome: "Fritadeira Elétrica Air Fryer Family Inox", preco: "R\$ 299,90", link: "https://magazinevoce.com.br", plataforma: "magazine_luiza" },
  { nome: "Jogo de Panelas Antiaderente Cerâmica de Época", preco: "R\$ 189,90", link: "https://shopee.com.br", plataforma: "shopee" }
];

// Dicionário de títulos informativos para cada uma das 6 comunidades
const TITULOS_MURAL = {
  g1: "💰 Mural de Amantes de Precim",
  g2: "🎟️ Mural de Quero Meu Desconto",
  g3: "🏠 Mural de Modernidade Lar",
  g4: "🍰 Mural de Confeitaria Fofosa",
  g5: "⚕️ Mural de Vida & Bem-Estar",
  g6: "🐾 Mural de Patinhas VIP"
};

let grupoAtivoLocal = "g1";

// 🎛️ NAVEGAÇÃO INTERATIVA DO MENU LATERAL POR CLIQUE DE MOUSE
function selecionarGrupoComunidade(gid) {
  grupoAtivoLocal = gid;

  // Atualiza as cores e o estado ativo do botão no menu lateral
  document.querySelectorAll('.grupo-item-btn').forEach(btn => btn.classList.remove('active'));
  const botaoAtivo = document.getElementById(`g-${gid}`);
  if (botaoAtivo) botaoAtivo.classList.add('active');

  // Altera o título do mural informando a comunidade em que se encontra
  const tituloMural = document.getElementById('mural-titulo-comunidade');
  if (tituloMural) tituloMural.innerText = TITULOS_MURAL[gid] || "💬 Mural de Conversas";

  // Se o usuário estiver no celular, fecha o menu lateral de forma sutil pós-clique
  const sidebar = document.getElementById('sidebar-panel');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }

  // Atualiza o feed e puxa os recados correspondentes daquela gaveta do banco
  renderizarCarrosselLoteQuadrado();
  carregarMensagensMuralDoServidor();
}

// 📰 INTEGRAÇÃO DOS CLIQUES DO CARROSSEL DE REVISTAS DO TOPO
function clicarRevistaBanner(gidAlvo) {
  // Despacha o usuário para o grupo correspondente à revista clicada
  selecionarGrupoComunidade(gidAlvo);
}

// 📱 LÓGICA DE ABRIR/FECHAR O MENU HAMBÚRGUER NO CELULAR COM O DEDO
function alternarMenuLateralMobile() {
  const sidebar = document.getElementById('sidebar-panel');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

// 📻 CAPTURA DINÂMICA DO ANÚNCIO VINTAGE DO MUNDO RETRÔ (DO BANCO D1)
async function carregarDestaqueRetroDoD1() {
  try {
    // Rota que criaremos no seu Pages para ler a tabela mundo_retro_anuncios
    const res = await fetch(`${API_URL}/api/retro-ler`);
    if (res.ok) {
      const anuncios = await res.json();
      if (anuncios && anuncios.length > 0) {
        const ultimo = anuncios[0]; // Pega o criativo retrô mais fresco
        document.getElementById('retro-exibe-titulo').innerText = ultimo.titulo_vintage.toUpperCase();
        document.getElementById('retro-exibe-copy').innerText = ultimo.prompt_gerado;
        document.getElementById('retro-exibe-preco').innerText = ultimo.url_link || "Consulte a Banca";
      }
    }
  } catch (e) {
    console.log("Módulo Retrô operando no template base padrão.");
  }
}

// ⚡ MONTAGEM DO CARROSSEL QUADRADO DE 4 ANÚNCIOS (PILOTO AUTOMÁTICO CRON)
function renderizarCarrosselLoteQuadrado() {
  const container = document.getElementById('grid-carrossel-cron');
  if (!container) return;
  container.innerHTML = '';

  // Filtra ou embaralha o lote para exibir 4 anúncios temáticos baseado no grupo
  loteQuatroAnunciosFixos.forEach((prod) => {
    container.innerHTML += `
      <div class="vaga-anuncio-box">
        <div>
          <span style="font-size:9px; color:#ea580c; font-weight:bold; text-transform:uppercase;">✨ ${prod.plataforma}</span>
          <h4 style="font-size:12px; font-weight:bold; margin-top:4px; line-height:1.3; color:#f4f4f5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${prod.nome}</h4>
        </div>
        <div>
          <div style="font-size:14px; font-weight:900; color:#eab308; margin-top:6px;">${prod.preco}</div>
          <button class="btn-comprar-vaga" onclick="window.open('${prod.link}', '_blank')">Comprar</button>
        </div>
      </div>
    `;
  });
}

// 💬 POSTAR MENSAGENS SILENCIOSAMENTE NO SOCIALBR (SEM POP-UPS NA TELA)
async function publicarMensagemMuralServidor(event) {
  event.preventDefault(); // Impede o recarregamento clássico da página HTML

  const txtMensagem = document.getElementById('txt-mural-mensagem');
  const txtAutor = document.getElementById('txt-mural-autor');
  
  const mensagem = txtMensagem.value.trim();
  const autor = txtAutor.value.trim();

  if (!mensagem || !autor) return;

  try {
    // Dispara em silêncio absoluto para salvar na tabela 'recados' do D1
    await fetch(`${API_URL}/api/socialbr-postar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gid: grupoAtivoLocal,
        autor: autor,
        texto: mensagem
      })
    });

    // Limpa apenas o campo da mensagem pós-envio, mantendo o nome do autor gravado
    txtMensagem.value = '';
    
    // Atualiza imediatamente o feed de forma invisível e fluida
    await carregarMensagensMuralDoServidor();

  } catch (e) {
    console.error("Falha silenciosa ao publicar mensagem:", e);
  }
}

// 📡 ATUALIZAÇÃO AUTOMÁTICA DOS LOGS E MENSAGENS DO MURAL (SEM TRAVAR O MOUSE)
async function carregarMensagensMuralDoServidor() {
  const boxMensagens = document.getElementById('box-mensagens-mural');
  if (!boxMensagens) return;

  try {
    const res = await fetch(`${API_URL}/api/socialbr-ler?gid=${grupoAtivoLocal}`);
    if (!res.ok) throw new Error();
    const mensagens = await res.json();

    if (mensagens.length === 0) {
      boxMensagens.innerHTML = '<div style="color: #71717a; text-align: center; font-size: 12px; padding: 20px;">Nenhum recado nesta comunidade ainda. Seja o primeiro!</div>';
      return;
    }

    boxMensagens.innerHTML = ''; // Limpa o aviso de vazio de forma fluida
    mensagens.forEach(msg => {
      const balao = document.createElement('div');
      balao.className = 'balao-mensagem-membro';
      balao.style.marginBottom = "8px";
      
      balao.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; color:#ea580c; margin-bottom:4px;">
          <span>👤 ${msg.nome}</span>
          <span style="color:#4b5563; font-weight:normal;">${new Date(msg.t).toLocaleTimeString('pt-BR')}</span>
        </div>
        <p style="font-size:12px; color:#e4e4e7; line-height:1.4; word-break:break-all;">${msg.texto}</p>
      `;
      boxMensagens.appendChild(balao);
    });

  } catch (e) {
    console.log("Aguardando rotas ativas do D1 na nuvem.");
  }
}

// GATILHO COMPLETO DE INICIALIZAÇÃO DO PORTAL MASTER
window.addEventListener('DOMContentLoaded', () => {
  renderInitialize();
  
  // Roda uma rotina silenciosa em background de atualização a cada 10 segundos
  setInterval(() => {
    carregarMensagensMuralDoServidor();
  }, 10000);
});

function renderInitialize() {
  renderizeLayoutBase();
  renderizarCarrosselLoteQuadrado();
  carregarDestaqueRetroDoD1();
  carregarMensagensMuralDoServidor();
}

function renderizeLayoutBase() {
  try {
    const hash = window.location.hash;
    if (hash && hash.includes('dados=')) {
      const base64 = hash.split('dados=');
      const dadosImportados = JSON.parse(atob(base64));
      if (dadosImportados.produtos) loteQuatroAnunciosFixos = dadosImportados.produtos;
    }
  } catch (e) { console.log("Aguardando feeds remotos."); }
}
