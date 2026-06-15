// MENU MOBILE TOGGLE (comum a ambas)
const menuToggle = document.getElementById('menuToggle');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
document.addEventListener("DOMContentLoaded", () => {

    const permissao = localStorage.getItem("permissao");
    const isAdmin = permissao === "admin";

    // REDIRECIONA ADMIN DIRETO
    if (isAdmin) {

        // se estiver na home logada, manda pro admin
        if (
            window.location.pathname.includes("homeLogado.html") ||
            window.location.pathname.includes("homeNaoLogado.html")
        ) {
            window.location.href = "/.vscode/src/adminUsuarios.html";
            return;
        }
    }

    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    if (isAdmin) {

        navbar.innerHTML = `
            <a href="/.vscode/src/adminUsuarios.html" class="nav-link">
                Usuários
            </a>

            <a href="/.vscode/src/adminReciclagens.html" class="nav-link">
                Reciclagens
            </a>
        `;

    } else {
        navbar.innerHTML = `
            <a href="/.vscode/src/homeLogado.html" class="nav-link">
                Home
            </a>
            <a href="/.vscode/src/ranking.html" class="nav-link">
                Ranking
            </a>
            <a href="/.vscode/src/registrarReciclagem.html" class="nav-link">
                Registrar Reciclagem
            </a>
            <a href="/.vscode/src/MapaDeColeta.html" class="nav-link">
                Mapa de Coleta
            </a>
            <a href="/.vscode/src/recompensas.html" class="nav-link active">
                Recompensas
            </a>
        `;
    }
});

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
    fetch("http://localhost:8000/dados-usuario", {
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
        // salvar permissão localmente para controle de menu
        if (dados.permissao) localStorage.setItem('permissao', dados.permissao);
    })
    .catch(err => console.error("Erro ao conectar ao Railway:", err));

    // FOTO DO USUÁRIO
    fetch("http://localhost:8000/perfil", {
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

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();

        localStorage.clear();
        sessionStorage.clear();

        window.location.href = "/.vscode/src/homeNaoLogado.html";
    });
}