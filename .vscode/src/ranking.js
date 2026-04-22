document.addEventListener("DOMContentLoaded", () => {
  carregarRanking();
  carregarProgresso();

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

  // Adicione aqui o código da foto
  const email = localStorage.getItem('email');
  if (email) {
    // ✅ FOTO DO USUÁRIO
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
});

async function carregarRanking() {
  const container = document.querySelector('#ranking-lista');

  // Mostrar loading
  container.innerHTML = `
    <h2>Top Recicladores</h2>
    <div class="loading">
      <div class="spinner"></div>
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

    container.innerHTML = '<h2>Top Recicladores</h2>';

    if (dados.length === 0) {
      container.innerHTML += '<p class="no-data">Nenhum reciclador cadastrado ainda.</p>';
      return;
    }

    dados.forEach(user => {
      // mostrar posição apenas se estiver no top-10; caso contrário mostrar '-º'
      const displayPos = (typeof user.posicao === 'number' && user.posicao <= 10) ? `${user.posicao}º` : '-º';
      container.innerHTML += `
        <div class="rank-item">
          <div class="rank-left">
            <div class="position">${displayPos}</div>
            <span>${user.nome}</span>
          </div>
          <span>${user.pontos} pts</span>
        </div>
       `;
    });
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    container.innerHTML = `
      <h2>Top Recicladores</h2>
      <div class="error-message">
        <p>❌ Erro ao carregar o ranking.</p>
        <p>Tente novamente mais tarde.</p>
      </div>
    `;
  }
}


async function carregarProgresso() {
  const email = localStorage.getItem("email");
  const container = document.getElementById("progresso-usuario");

  if (!email) {
    container.innerHTML = "<p>Usuário não logado</p>";
    return;
  }

  try {
    // 🔥 pega dados do usuário
    const resUser = await fetch('https://lixie-production.up.railway.app/dados-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${email}`
    });

    const usuario = await resUser.json();

    // 🔥 pega ranking completo
    const resRanking = await fetch('https://lixie-production.up.railway.app/ranking', {
      method: 'POST'
    });

    const ranking = await resRanking.json();

    //  acha posição real
    // Preferir a posição fornecida pelo endpoint /dados-usuario (inclui usuários fora do top-10)
    let posicao = (typeof usuario.posicao !== 'undefined' && usuario.posicao !== null) ? usuario.posicao : null;

    if (!posicao) {
      // se backend não forneceu, tenta achar pelo nome entre os top retornados
      posicao = ranking.find(user => user.nome === usuario.nome)?.posicao || "-";
    }

    // 🔥calcula barra (quando não for possível determinar posição, evita NaN)
    const total = ranking.length;
    let porcentagem = 0;
    if (typeof posicao === 'number' || !isNaN(parseInt(posicao))) {
      const posNum = parseInt(posicao);
      porcentagem = ((total - posNum + 1) / Math.max(total, posNum)) * 100;
      porcentagem = Math.max(0, Math.min(100, porcentagem));
    }

    container.innerHTML = `
      <h2>Seu Progresso</h2>
      <p>Você está em: <strong>${posicao}º Lugar</strong></p>
      <p><strong>${usuario.pontos} Pontos</strong></p>

      <div class="progress-bar">
        <div class="progress" style="width: ${porcentagem}%"></div>
      </div>
    `;

  } catch (erro) {
    console.error(erro);
    container.innerHTML = "<p>Erro ao carregar progresso</p>";
  }
}