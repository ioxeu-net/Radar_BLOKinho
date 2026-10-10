// Função básica que realiza a troca das abas pelo mouse
function alternarAba(nomeAba) {
    document.querySelectorAll('.tab-content').forEach(conteudo => {
        conteudo.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(botao => {
        botao.classList.remove('active');
    });

    document.getElementById(`aba-${nomeAba}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Configurações rígidas de IDs do sistema
const AFILIADOS = {
    amazon: "coloposte-20",
    shopee: "18338650355",
    magalu: "magazinehdmicroloja"
};

// Exemplo da função Carwash operando na lógica da interface web
function limparEInjetarLink(urlBruta, plataforma) {
    let urlFinal = urlBruta;

    if (plataforma === "amazon") {
        urlFinal = `https://amazon.com.br{extrairAsinAmazon(urlBruta)}?tag=${AFILIADOS.amazon}`;
    } else if (plataforma === "shopee") {
        urlFinal = `${urlBruta.split('?')[0]}?uls_trackid=${AFILIADOS.shopee}`;
    } else if (plataforma === "magazine_luiza") {
        urlFinal = `https://magazinevoce.com.br{AFILIADOS.magalu}/`;
    }

    return urlFinal;
}

function extrairAsinAmazon(url) {
    const match = url.match(/\/dp\/([A-Z0-9]{10})/);
    return match ? match[1] : "";
}
