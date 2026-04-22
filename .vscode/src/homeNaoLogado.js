// home.js (Público)
console.log("Bem-vinda à Home Pública!");

// MENU MOBILE TOGGLE
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

// Se você quiser mostrar o Ranking Global vindo do banco, 
// você pode fazer um fetch aqui, mas sem precisar de e-mail.

// CARREGAR RANKING NA HOME
async function carregarRankingHome() {
    const container = document.querySelector('#home-ranking-lista');
    
    if (!container) return;

    // Mostrar loading
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
                <p>Tente novamente mais tarde.</p>
            </div>
        `;
    }
}

// Carregar ranking quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", carregarRankingHome);

// EVENT LISTENERS PARA BOTÕES
document.addEventListener("DOMContentLoaded", () => {
    const btnRankingComplete = document.querySelector('.btn-ranking-complete');
    const btnRegisterRecycling = document.querySelector('.btn-register-recycling');

    if (btnRankingComplete) {
        btnRankingComplete.addEventListener('click', () => {
            window.location.href = '/.vscode/src/cadastrese.html';
        });
    }

    if (btnRegisterRecycling) {
        btnRegisterRecycling.addEventListener('click', () => {
            window.location.href = '/.vscode/src/cadastrese.html';
        });
    }
});

// EFEITO FADE-IN NO SCROLL
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


// INTERSECTION OBSERVER MELHORADO
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