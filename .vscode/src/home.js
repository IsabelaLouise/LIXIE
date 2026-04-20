// 1. TENTA LER o email que deveria estar salvo
// home.js - ALTERE A PRIMEIRA LINHA
const email = localStorage.getItem('email');

if (!email || email === "undefined" || email === null) {
    console.log("Acesso negado! Redirecionando...");
    window.location.href = "homeNaoLogado.html";
} else {

    // DADOS DO USUÁRIO
    fetch("https://lixie-production.up.railway.app/dados-usuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(email)}`
    })
    .then(res => res.json())
    .then(dados => {
        document.getElementById("nome").textContent = dados.nome;
        document.getElementById("pontos").textContent = dados.pontos;
        document.getElementById("nivel").textContent = dados.nivel;
    })
    .catch(err => console.error("Erro ao conectar ao Railway:", err));

    // ✅ FOTO DO USUÁRIO (AGORA NO LUGAR CERTO)
    fetch("https://lixie-production.up.railway.app/perfil", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(email)}`
    })
    .then(res => res.json())
    .then(usuario => {
        const fotoHome = document.getElementById("fotoHome");

        if (usuario.foto && usuario.foto.trim().startsWith("http")) {
            fotoHome.src = usuario.foto.trim();
        } else {
            fotoHome.src = "img/avatar.png";
        }
    })
    .catch(err => console.error("Erro ao carregar foto:", err));
}


function logout() {
    localStorage.removeItem("usuarioEmail");
    window.location.href = "/homeNaoLogado.html";
}

// CARREGAR RANKING NA HOME LOGADA
async function carregarRankingHomeLogada() {
    const container = document.querySelector('#home-ranking-lista');
    
    if (!container) return;

    try {
        const response = await fetch('https://lixie-production.up.railway.app/ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const dados = await response.json();

        container.innerHTML = '';

        if (dados.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum reciclador cadastrado ainda.</p>';
            return;
        }

        // Mostrar apenas top 5
        dados.slice(0, 5).forEach((user, index) => {
            container.innerHTML += `
                <div class="rank-item">
                    <div class="rank-left">
                        <div class="position">${index + 1}</div>
                        <span class="rank-name">${user.nome}</span>
                    </div>
                    <span class="rank-points">${user.pontos} pts</span>
                </div>
            `;
        });
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        container.innerHTML = `
            <div class="error-message">
                <p>❌ Erro ao carregar o ranking.</p>
            </div>
        `;
    }
}

// CARREGAR PROGRESSO DO USUÁRIO NA HOME LOGADA
async function carregarProgressoHomeLogada() {
    const email = localStorage.getItem("email");
    const container = document.getElementById("home-progresso-usuario");

    if (!container || !email) return;

    try {
        const response = await fetch('https://lixie-production.up.railway.app/dados-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${encodeURIComponent(email)}`
        });

        const dados = await response.json();
        const porcentagem = Math.min((dados.pontos / 10000) * 100, 100);

        container.innerHTML = `
            <p class="progress-text">Você está em: <strong>${dados.nivel}º Lugar</strong></p>
            <p><strong>${dados.pontos} Pontos</strong></p>

            <div class="progress-bar">
                <div class="progress" style="width: ${porcentagem}%"></div>
            </div>
        `;
    } catch (erro) {
        console.error(erro);
        container.innerHTML = "<p>Erro ao carregar progresso</p>";
    }
}

// CARREGAR DADOS DE RECICLAGEM DESSA SEMANA
async function carregarReciclagemsemana() {
    const email = localStorage.getItem("email");
    const container = document.getElementById("home-reciclagens-semana");

    if (!container || !email) return;

    try {
        const response = await fetch('https://lixie-production.up.railway.app/dados-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${encodeURIComponent(email)}`
        });

        const dados = await response.json();
        const reciclagens = dados.reciclagens_semana || 0;

        container.innerHTML = `
            <img src="/.vscode/src/img/sinal-de-reciclagem.png" alt="reciclagem" class="reciclagem-img">
            ${reciclagens} reciclagens essa semana
        `;
    } catch (error) {
        console.error('Erro ao carregar reciclagens:', error);
    }
}

// CARREGAR RECOMPENSAS GANHAS
async function carregarRecompensas() {
    const email = localStorage.getItem("email");
    const container = document.getElementById("home-recompensas-ganhas");

    if (!container || !email) return;

    try {
        const response = await fetch('https://lixie-production.up.railway.app/dados-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${encodeURIComponent(email)}`
        });

        const dados = await response.json();
        const recompensas = dados.recompensas_ganhas || 0;

        container.innerHTML = `
            <img src="/.vscode/src/img/presente.png" alt="presente" class="presente-img">
            ${recompensas} recompensas ganhas
        `;
    } catch (error) {
        console.error('Erro ao carregar recompensas:', error);
    }
}

// CARREGAR TUDO QUANDO O DOM ESTIVER PRONTO
document.addEventListener("DOMContentLoaded", () => {
    carregarRankingHomeLogada();
    carregarProgressoHomeLogada();
    carregarReciclagemsemana();
    carregarRecompensas();

    // EFEITO FADE-IN NO SCROLL
    const sections = document.querySelectorAll('.ranking, .como-funciona, .impacto-ambiental, .artigos');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        observer.observe(section);
    });
});