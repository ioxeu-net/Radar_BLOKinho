const CONTEUDOS_DICAS = {
  todos: {
    titulo: "💡 PORTAL MULTIMÍDIA HD",
    texto: "Seja bem-vindo à nossa banca digital! Escolha uma revista ou categoria para acessar dicas, receitas e ofertas focadas no seu dia a dia."
  },
  casa: {
    titulo: "🏠 TRUQUE DE DONA DE CASA",
    texto: "Para limpar espelhos sem deixar fiapos ou manchas: use um pano de microfibra úmido apenas com água morna e algumas gotas de vinagre de álcool. O brilho é imediato!"
  },
  bolos: {
    titulo: "🍰 SEGREDO DO BOLO FOCOSO",
    texto: "Substitua o leite comum por água morna e adicione uma colherzinha de café de bicarbonato de sódio. O bolo de chocolate vai crescer muito e ficar super escuro e fofinho!"
  },
  comidas: {
    titulo: "🍲 PANELÃO DE PRESSÃO PRÁTICO",
    texto: "Sela a carne direto na panela, joga o arroz e os vegetais. Cubra com água fervente e, após pegar pressão, conte apenas 3 minutos. Almoço completo rápido!"
  },
  molhos: {
    titulo: "🍅 CORTAR ACIDEZ DO TOMATE",
    texto: "Não use açúcar para tirar o azedo do molho! Coloque uma cenoura descascada inteira para cozinhar junto na panela. Ela puxa a acidez naturalmente."
  },
  medicina: {
    titulo: "⚕️ CUIDADOS E BEM-ESTAR",
    texto: "Beber um copo de água morna em jejum logo pela manhã ajuda a ativar o trânsito intestinal e acelera o metabolismo de forma natural. Cuide da sua saúde!"
  },
  pets: {
    titulo: "🐾 MUNDO ANIMAL EXTRA",
    texto: "Nunca dê chocolate, cebola ou uvas para o seu cão ou gato. Esses alimentos contêm toxinas graves que afetam os rins e o coração dos bichinhos."
  }
};

let produtosLoja = [
  { nome: "Kit 12 Potes Herméticos Organizadores para Molhos", link: "https://shopee.com.br", categoria: "molhos" },
  { nome: "Batedeira Planetária Turbo para Massas de Bolos", link: "https://amazon.com.br", categoria: "bolos" },
  { nome: "Suporte Organizador de Vassouras - Casa Inteligente", link: "https://magazinevoce.com.br", categoria: "casa" },
  { nome: "Termômetro Digital Premium Infravermelho Hospitalar", link: "https://amazon.com.br", categoria: "medicina" },
  { nome: "Comedouro Automático Inteligente para Cães e Gatos", link: "https://shopee.com.br", categoria: "pets" }
];

let categoriaAtivaLocal = "todos";

// 💥 A MÁGICA DE CLICAR NA REVISTA DO BANNER NO TOPO 💥
function clicarNaRevista(nomeRevista) {
  // Faz a troca inteligente baseada na revista escolhida pelo mouse/dedo
  if (nomeRevista === 'Culinária') filtrarCategoria('bolos');
  else if (nomeRevista === 'Medicina') filtrarCategoria('medicina');
  else if (nomeRevista === 'Pets') filtrarCategoria('pets');
  else filtrarCategoria('todos');
}

function filtrarCategoria(categoriaAlvo) {
  categoriaAtivaLocal = categoriaAlvo;

  document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
  const botaoAtivo = document.getElementById(`f-${categoriaAlvo}`);
  if (botaoAtivo) botaoAtivo.classList.add('active');

  const dica = CONTEUDOS_DICAS[categoriaAlvo];
  document.getElementById('dica-titulo').innerText = dica.titulo;
  document.getElementById('dica-texto').innerText = dica.texto;

  renderizarFiltroProdutos();
}

function renderizarFiltroProdutos() {
  const container = document.getElementById('vitrine-dinamica');
  if (!container) return;
  container.innerHTML = '';

  const produtosFiltrados = categoriaAtivaLocal === "todos" 
    ? produtosLoja 
    : produtosLoja.filter(p => p.categoria === categoriaAtivaLocal);

  if (produtosFiltrados.length === 0) {
    container.innerHTML = '<div style="color:#71717a; text-align:center; font-size:12px; padding:20px;">Aguardando novos achadinhos do robô para esta seção...</div>';
    return;
  }

  produtosFiltrados.forEach((prod) => {
    container.innerHTML += `
      <div class="product-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge-off">-30% OFF</span>
          <span style="font-size:10px; color:#71717a; text-transform:uppercase; font-weight:bold;">✨ ${prod.categoria}</span>
        </div>
        <h3 class="prod-title">${prod.nome}</h3>
        <p class="prod-link">${prod.link}</p>
        <button class="btn-zap" onclick="window.open('${prod.link}', '_blank')">
          🟢 1 CLIQUE ZAP / COMPRAR
        </button>
      </div>
    `;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  renderizarFiltroProdutos();
});
