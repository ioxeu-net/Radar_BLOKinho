// Dicionário de conteúdos e dicas por categoria para manter a página dinâmica
const CONTEUDOS_DICAS = {
  todos: {
    titulo: "💡 ESPAÇO COOPERATIVO HD",
    texto: "Seja bem-vindo! Navegue pelos nossos espaços para conferir receitas exclusivas, truques de organização para o lar e os melhores achados promocionais para a sua cozinha!"
  },
  casa: {
    titulo: "🏠 TRUQUE DE DONA DE CASA",
    texto: "Para tirar manchas de gordura de potes plásticos rapidamente: coloque um pouco de detergente, água morna e um pedaço de papel toalha dentro. Tampe e balance bem por 30 segundos usando as mãos. Fica limpinho!"
  },
  bolos: {
    titulo: "🍰 SEGREDO DO BOLO FOCOSO",
    texto: "Quer um bolo de chocolate super fofinho e úmido? Substitua o leite da receita tradicional por água morna e adicione uma colher de café de bicarbonato de sódio junto ao fermento. A massa cresce muito mais!"
  },
  comidas: {
    titulo: "🍲 COMIDA DE UM PANELÃO SÓ",
    texto: "Dias corridos pedem praticidade! Experimente selar a carne na panela de pressão, adicionar o arroz cru, vegetais picados e cobrir com água fervente. Feche a pressão e conte apenas 3 minutos após chiar. Refeição completa!"
  },
  molhos: {
    titulo: "🍅 MOLHO DE TOMATE ARTESANAL",
    texto: "Para cortar a acidez natural do molho de tomate sem usar açúcar, adicione uma cenoura pequena inteira descascada para cozinhar junto no extrato. Ela absorve toda a acidez e deixa o sabor suave!"
  }
};

// Seus produtos cadastrados no sistema divididos por nicho/categoria
let produtosLoja = [
  { nome: "Kit 12 Potes Organizadores Herméticos para Molhos e Temperos", link: "https://shopee.com.br", categoria: "molhos" },
  { nome: "Batedeira Planetária de Alta Performance para Massas e Bolos", link: "https://amazon.com.br", categoria: "bolos" },
  { nome: "Mesa de Cabeceira Suspensa - Organização Casa", link: "https://magazinevoce.com.br", categoria: "casa" },
  { nome: "Jogo de Panelas Antiaderente Cerâmica Premium", link: "https://shopee.com.br", categoria: "comidas" }
];

let categoriaAtivaLocal = "todos";

function filtrarCategoria(categoriaAlvo) {
  categoriaAtivaLocal = categoriaAlvo;

  // Atualiza as cores dos botões de filtro usando o mouse
  document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
  const botaoAtivo = document.getElementById(`f-${categoriaAlvo}`);
  if (botaoAtivo) botaoAtivo.classList.add('active');

  // Muda dinamicamente o texto informativo da dica correspondente
  const dica = CONTEUDOS_DICAS[categoriaAlvo];
  document.getElementById('dica-titulo').innerText = dica.titulo;
  document.getElementById('dica-texto').innerText = dica.texto;

  renderizarFiltroProdutos();
}

function renderizarFiltroProdutos() {
  const container = document.getElementById('vitrine-dinamica');
  if (!container) return;
  container.innerHTML = '';

  // Filtra de forma inteligente os anúncios daquela pasta
  const produtosFiltrados = categoriaAtivaLocal === "todos" 
    ? produtosLoja 
    : produtosLoja.filter(p => p.categoria === categoriaAtivaLocal);

  if (produtosFiltrados.length === 0) {
    container.innerHTML = '<div style="color:#71717a; text-align:center; font-size:12px; padding:20px;">Aguardando novos achadinhos automáticos do robô para este espaço...</div>';
    return;
  }

  produtosFiltrados.forEach((prod, idx) => {
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
  // Tenta ler o hash se os dados vierem formatados via automação do WhatsApp
  try {
    const hash = window.location.hash;
    if (hash && hash.includes('dados=')) {
      const base64 = hash.split('dados=')[1];
      const importados = JSON.parse(atob(base64));
      if (importados.produtos) produtosLoja = importados.produtos;
    }
  } catch (e) { console.log("Aguardando feeds."); }

  renderizarFiltroProdutos();
});
