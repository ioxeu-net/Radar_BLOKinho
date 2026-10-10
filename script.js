document.addEventListener('DOMContentLoaded', () => {
    const btnFila = document.getElementById('btn-fila');
    const btnConfig = document.getElementById('btn-config');
    const abaFila = document.getElementById('aba-fila');
    const abaConfig = document.getElementById('aba-config');
    const listaProdutos = document.getElementById('lista-produtos');
    const btnCarregar = document.getElementById('btn-carregar');

    // Substitua pela URL do seu projeto do Cloudflare Pages (Ex: https://pages.dev)
    const API_URL = window.location.origin;

    // Troca de abas usando o mouse
    btnFila.addEventListener('click', () => {
        btnFila.classList.add('active');
        btnConfig.classList.remove('active');
        abaFila.classList.add('active');
        abaConfig.classList.remove('active');
    });

    btnConfig.addEventListener('click', () => {
        btnConfig.classList.add('active');
        btnFila.classList.remove('active');
        abaConfig.classList.add('active');
        abaFila.classList.remove('active');
    });

    // Função que busca os dados gravados pelo Worker no banco D1
    async function carregarFilaReal() {
        listaProdutos.innerHTML = '<div class="card-vazio">Buscando ofertas no banco D1...</div>';
        
        try {
            // Como criamos a API dentro do mesmo Pages, chamamos a rota relativa
            const response = await fetch(`${API_URL}/api/achadinhos-ler`);
            if (!response.ok) throw new Error('Erro ao ler banco de dados');
            
            const produtos = await response.json();
            
            if (produtos.length === 0) {
                listaProdutos.innerHTML = '<div class="card-vazio">Nenhum produto na fila. O WhatsApp está monitorando!</div>';
                return;
            }

            listaProdutos.innerHTML = ''; // Limpa o aviso de vazio

            // Cria visualmente os cards de monitoramento na tela
            produtos.forEach(prod => {
                const card = document.createElement('div');
                card.className = 'card-admin';
                card.style.borderLeft = '4px solid #4ade80';
                card.style.marginBottom = '15px';
                
                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-size: 12px; font-weight: bold; color: #4ade80; uppercase">${prod.plataforma}</span>
                        <span style="font-size: 11px; color: #64748b;">${new Date(prod.data_captura).toLocaleString('pt-BR')}</span>
                    </div>
                    <p style="font-size: 14px; color: #f1f5f9; margin-bottom: 12px; line-height: 1.4;">${prod.texto_bruto || 'Sem descrição'}</p>
                    <a href="${prod.url_original}" target="_blank" style="display: inline-block; background-color: #334155; color: #4ade80; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-decoration: none;">🔗 Verificar Link Bruto</a>
                `;
                listaProdutos.appendChild(card);
            });

        } catch (err) {
            listaProdutos.innerHTML = `<div class="card-vazio" style="color: #ef4444;">Erro ao carregar dados: ${err.message}</div>`;
        }
    }

    // Carrega automaticamente ao abrir e ao clicar no botão com o mouse
    btnCarregar.addEventListener('click', carregarFilaReal);
    carregarFilaReal();
});
