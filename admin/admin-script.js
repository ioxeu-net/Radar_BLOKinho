const API_URL = window.location.origin;

// 🔒 VALIDAÇÃO DO PIN DE ACESSO EXCLUSIVO
function validarAcessoAdmin() {
  const entrada = document.getElementById('txt-senha').value;
  if (entrada === "0660") {
    document.getElementById('caixa-autenticacao').style.display = 'none';
    document.getElementById('painel-privado').style.display = 'block';
    // Carrega os logs automáticos ao destravar com sucesso
    carregarDadosD1DoPainel();
  } else {
    alert("❌ PIN Incorreto! Acesso negado.");
    document.getElementById('txt-senha').value = '';
  }
}

// 📑 GERENCIADOR DE TROCA DE ABAS POR CLIQUE
function mudarAba(alvo) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`content-${alvo}`).classList.add('active');
  document.getElementById(`btn-${alvo}`).classList.add('active');
}

// 📻 INTELIGÊNCIA PUBLICITÁRIA DO MUNDO RETRÔ (ANOS 50/60)
function gerarLayoutAnuncioRetro() {
  const nome = document.getElementById('retro-input-nome').value.trim();
  const preco = document.getElementById('retro-input-preco').value.trim();
  
  if (!nome) {
    alert("Por favor, digite o nome do produto para o criativo vintage!");
    return;
  }

  // Alimenta em tempo real a moldura estética retrô
  document.getElementById('retro-txt-titulo').innerText = nome.toUpperCase();
  if (preco) {
    document.getElementById('retro-txt-preco').innerText = preco;
  } else {
    document.getElementById('retro-txt-preco').innerText = "Consulte a nossa banca";
  }
  
  // Dicionário de slogans autênticos da era de ouro da publicidade americana/brasileira
  const copysVintage = [
    `"Distinção e elegância para a dona de casa exigente! O formidável ${nome} chegou para trazer felicidade e modernidade ao seu distinto lar!"`,
    `"Economize valiosos minutos e garanta o contentamento da família com o sensacional ${nome}. Uma utilidade prática indispensável!"`,
    `"Não fique para trás na gloriosa era da automação! Adquira hoje mesmo o magnífico ${nome} para o conforto mecânico de sua residência."`
  ];
  
  const copySugerida = copysVintage[Math.floor(Math.random() * copysVintage.length)];
  document.getElementById('retro-txt-copy').innerText = copySugerida;
}

// 💛 GERADOR EXCLUSIVO MLB 1 (UNITÁRIO)
async function gerarLinkUnitario() {
  const url = document.getElementById('input-unitario').value.trim();
  if (!url) return;
  let urlLimpa = url.split('?')[0];

  try {
    await fetch(`${API_URL}/api/achadinhos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        plataforma: "mercado_livre", 
        url_original: urlLimpa, 
        texto_bruto: "Link Unitário gerado via Carwash Executivo ML" 
      })
    });
    alert("Link higienizado e arquivado com sucesso na gaveta mercado_livre!");
    document.getElementById('input-unitario').value = '';
    carregarDadosD1DoPainel(); // Recarrega os registros
  } catch (e) {
    alert("Falha ao comunicar com a API do Pages.");
  }
}

// 📦 GERADOR EXCLUSIVO MLB 2 (LOTES)
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
          body: JSON.stringify({ 
            plataforma: "mercado_livre", 
            url_original: limpo, 
            texto_bruto: "Produto importado em lote através do extrator executivo" 
          })
        });
      }
    }
  }
  alert(`Importação concluída! ${c} links salvos isolados no D1.`);
  document.getElementById('input-lote').value = '';
  carregarDadosD1DoPainel();
}

// 📡 LEITOR EM TEMPO REAL DO BANCO CLOUDFLARE D1
async function carregarDadosD1DoPainel() {
  const logBox = document.getElementById('log-tabelas-painel');
  if (!logBox) return;
  logBox.innerHTML = '<div style="color:#60a5fa; text-align:center; padding:10px;">Lendo registros do D1...</div>';
  
  try {
    const res = await fetch(`${API_URL}/api/achadinhos-ler`);
    const dados = await res.json();
    
    if (dados.length === 0) {
      logBox.innerHTML = '<div style="color:#71717a; text-align:center; padding:10px;">Nenhum anúncio capturado pelas partições ainda.</div>';
      return;
    }
    
    logBox.innerHTML = '';
    dados.forEach(p => {
      const item = document.createElement('div');
      item.style.cssText = "background:#09090b; padding:10px; border-radius:8px; border-left:3px solid #10b981; text-align:left; margin-bottom:6px; border-top: 1px solid rgba(255,255,255,0.02);";
      
      // Define a tag de cor baseada no tipo de plataforma capturada
      let tagCor = p.plataforma === "mercado_livre" ? "#eab308" : "#10b981";
      
      item.innerHTML = `
        <div style='display:flex; justify-content:space-between; font-size:10px; font-weight:bold; color:${tagCor}; margin-bottom:4px;'>
          <span>${p.plataforma.toUpperCase()}</span>
          <span style='color:#71717a;'>${new Date(p.data_captura).toLocaleTimeString('pt-BR')}</span>
        </div>
        <div style='color:#f4f4f5; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;'>
          ${p.texto_bruto || p.url_original}
        </div>`;
      logBox.appendChild(item);
    });
  } catch(e) { 
    logBox.innerHTML = '<div style="color:#ef4444; text-align:center;">Erro ao ler tabelas Cloudflare.</div>'; 
  }
}

