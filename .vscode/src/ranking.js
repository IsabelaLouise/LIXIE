document.addEventListener("DOMContentLoaded", carregarRanking);

document.addEventListener("DOMContentLoaded", carregarRanking);

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
      container.innerHTML += `
        <div class="rank-item">
          <div class="rank-left">
            <div class="position">${user.posicao}</div>
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
    const response = await fetch('https://lixie-production.up.railway.app/dados-usuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `email=${email}`
    });

    const dados = await response.json();

    const porcentagem = Math.min((dados.pontos / 10000) * 100, 100);

    container.innerHTML = `
      <h2>Seu Progresso</h2>
      <p>Você está em: <strong>${dados.nivel}º Lugar</strong></p>
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

document.addEventListener("DOMContentLoaded", () => {
  carregarRanking();
  carregarProgresso();
});