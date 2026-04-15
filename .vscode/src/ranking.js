document.addEventListener("DOMContentLoaded", carregarRanking);

document.addEventListener("DOMContentLoaded", carregarRanking);

async function carregarRanking() {
  const response = await fetch('http://127.0.0.1:8000/ranking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const dados = await response.json();

  const container = document.querySelector('#ranking-lista');

  container.innerHTML = '<h2>Top Recicladores</h2>';

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
}