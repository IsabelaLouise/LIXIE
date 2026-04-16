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

  const response = await fetch('https://lixie-production.up.railway.app/ranking', {
    method: 'POST'
  });

  const ranking = await response.json();

  const top1 = ranking[0];
  const usuario = ranking.find(u => u.email === email);

  if (!usuario) return;

  const porcentagem = top1.pontos > 0 
  ? (usuario.pontos / top1.pontos) * 100 
  : 0;

  // Atualiza UI
  document.querySelector(".progress-text").innerHTML = `
    Você está em: <strong>${usuario.posicao}º Lugar</strong><br>
    <strong>${usuario.pontos} Pontos</strong>
  `;

  document.querySelector(".progress").style.width = `${porcentagem}%`;
}