// home.js - Arquivo único para homeNaoLogado.html e homeLogado.html


// MENU MOBILE TOGGLE (comum a ambas)
const menuToggle = document.getElementById('menuToggle');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle menu ao clicar no botão
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navbar.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Fechar menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Fechar menu ao redimensionar para desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        navbar.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// VERIFICAR SE USUÁRIO ESTÁ LOGADO
const email = localStorage.getItem('email');
const usuarioLogado = email && email !== "undefined" && email !== null;

// REDIRECIONAMENTO SE NÃO LOGADO NA PÁGINA LOGADA
if (window.location.pathname.includes('homeLogado.html') && !usuarioLogado) {
    console.log("Acesso negado! Redirecionando...");
    window.location.href = "homeNaoLogado.html";
}

// FUNÇÕES PARA USUÁRIO LOGADO
if (usuarioLogado) {
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

    // FOTO DO USUÁRIO
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

// FUNÇÃO LOGOUT
function logout() {
    // tentativa robusta de sair sem prompt e redirecionar imediatamente
    try { window.onbeforeunload = null; } catch (e) { /* ignore */ }

    // fechar dialogs abertos
    try {
        document.querySelectorAll('dialog').forEach(d => { try { if (typeof d.close === 'function') d.close(); } catch(e){} });
    } catch (e) {}

    // clonar e substituir formulários/inputs para remover event listeners ligados aos elementos
    try {
        document.querySelectorAll('form, input, textarea, select, button').forEach(el => {
            const clone = el.cloneNode(true);
            el.parentNode && el.parentNode.replaceChild(clone, el);
        });
    } catch (e) {}

    // limpar localStorage e redirecionar sem criar histórico
    localStorage.removeItem("usuarioEmail");
    localStorage.removeItem("email");

    // usar replace (sem histórico) e também assign como fallback
    try {
        window.location.replace('/.vscode/src/homeNaoLogado.html');
    } catch (e) {
        window.location.href = '/.vscode/src/homeNaoLogado.html';
    }
}

// CARREGAR RANKING 
async function carregarRankingHome() {
    const container = document.querySelector('#home-ranking-lista');
    
    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            <p>Carregando ranking...</p>
        </div>
    `;

    try {
        const response = await fetch('https://lixie-production.up.railway.app/ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const dados = await response.json();
        console.log('Dados do ranking:', dados);  // Adicione esta linha para verificar

        container.innerHTML = '';

        if (dados.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum reciclador cadastrado ainda.</p>';
            return;
        }

        dados.slice(0, 5).forEach((user, index) => {
            console.log('Usuário:', user);  // Adicione esta linha para verificar cada usuário
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
                <p>Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// FUNÇÕES ESPECÍFICAS PARA LOGADO
async function carregarProgressoHomeLogada() {
    if (!usuarioLogado) return;
    
    const container = document.getElementById("home-progresso-usuario");
    if (!container) return;

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

            // se o backend já retornou a posição do usuário, use-a (inclui usuários fora do top-10)
            const posicaoUsuario = (typeof dados.posicao !== 'undefined' && dados.posicao !== null) ? dados.posicao : null;
            const posText = posicaoUsuario ? `${posicaoUsuario}º Lugar` : `${dados.nivel}`;

            container.innerHTML = `
                <p class="progress-text">Você está em: <strong>${posText}</strong></p>
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

async function carregarReciclagemsemana() {
    if (!usuarioLogado) return;
    
    const container = document.getElementById("home-reciclagens-semana");
    if (!container) return;

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

async function carregarRecompensas() {
    if (!usuarioLogado) return;
    
    const container = document.getElementById("home-recompensas-ganhas");
    if (!container) return;

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

// EVENT LISTENERS PARA BOTÕES
document.addEventListener("DOMContentLoaded", () => {
    const btnRankingComplete = document.querySelector('.btn-ranking-complete');
    const btnRegisterRecycling = document.querySelector('.btn-register-recycling');

    if (btnRankingComplete) {
        btnRankingComplete.addEventListener('click', () => {
            window.location.href = usuarioLogado ? '/.vscode/src/ranking.html' : '/.vscode/src/cadastrese.html';
        });
    }

    if (btnRegisterRecycling) {
        btnRegisterRecycling.addEventListener('click', () => {
            window.location.href = usuarioLogado ? '/.vscode/src/registrarReciclagem.html' : '/.vscode/src/cadastrese.html';
        });
    }
});

// EFEITO FADE-IN NO SCROLL (comum)
document.addEventListener("DOMContentLoaded", () => {
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

// ANIMAÇÃO DE NÚMEROS (IMPACTO)
function animarNumeros() {
    const numeros = document.querySelectorAll('.impacto-numero');

    numeros.forEach(numero => {
        const target = +numero.getAttribute('data-target');
        let count = 0;

        const update = () => {
            const increment = target / 60;
            if (count < target) {
                count += increment;
                numero.innerText = Math.ceil(count);
                requestAnimationFrame(update);
            } else {
                numero.innerText = target + "+";
            }
        };

        update();
    });
}

// INTERSECTION OBSERVER PARA ANIMAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('.impacto-ambiental');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animarNumeros();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
});

// CARREGAR DADOS AO CARREGAR PÁGINA
document.addEventListener("DOMContentLoaded", () => {
    carregarRankingHome();
    
    if (usuarioLogado) {
        carregarProgressoHomeLogada();
        carregarReciclagemsemana();
        carregarRecompensas();
    }
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();

        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "/.vscode/src/homeNaoLogado.html";
    });
}

//para jogar para o cadastrese caso nao esteja logado
const logado = localStorage.getItem("logado");

if (logado !== "true") {
  window.location.href = "cadastro.html"; 
}