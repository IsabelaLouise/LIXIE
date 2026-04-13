let tipoSelecionado = "";
let pontosTotais = 0;

// pontos por material (base em KG)
const pontosPorMaterial = {
  plastico: 10,
  papel: 5,
  vidro: 8,
  metal: 15,
  organico: 6
};

// 🔥 converter para KG
function converterParaKg(valor, unidade) {
  switch (unidade) {
    case "g":
      return valor / 1000;
    case "kg":
      return valor;
    case "ton":
      return valor * 1000;
    case "un":
      return valor; // pode ajustar depois
    default:
      return valor;
  }
}

// selecionar material
document.querySelectorAll("#materiais button").forEach(btn => {
  btn.addEventListener("click", () => {
    tipoSelecionado = btn.dataset.tipo;

    document.querySelectorAll("#materiais button").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
  });
});

// enviar formulário
document.getElementById("formReciclagem").addEventListener("submit", (e) => {
  e.preventDefault();

  const quantidade = parseFloat(document.getElementById("quantidade").value);
  const unidade = document.getElementById("unidade").value;
  const resultado = document.getElementById("resultado");

  // validações
  if (!tipoSelecionado) {
    resultado.className = "erro";
    resultado.innerText = "⚠️ Selecione um material!";
    return;
  }

  if (!quantidade || quantidade <= 0) {
    resultado.className = "erro";
    resultado.innerText = "⚠️ Digite uma quantidade válida!";
    return;
  }

  // 🔥 CONVERSÃO CORRETA
  const quantidadeKg = converterParaKg(quantidade, unidade);

  // 🔥 CÁLCULO CORRETO
  const pontos = Math.round(
    quantidadeKg * (pontosPorMaterial[tipoSelecionado] || 0)
  );

  pontosTotais += pontos;

  atualizarPainel();

  // mensagem final
  resultado.className = "sucesso";
  resultado.innerHTML = `
    ✅ Registrado com sucesso! <br>
    ♻️ Material: ${tipoSelecionado} <br>
    ⚖️ Quantidade: ${quantidade} ${unidade} <br>
    📦 Equivalente: ${quantidadeKg.toFixed(2)} kg <br>
    ⭐ Pontos ganhos: ${pontos}
  `;

  // limpar formulário
  document.getElementById("quantidade").value = "";
  tipoSelecionado = "";
  document.querySelectorAll("#materiais button").forEach(b => b.classList.remove("ativo"));
});


// 🔥 AGORA FORA DO SUBMIT (CORRETO)
function atualizarPainel() {
  const nivelEl = document.getElementById("nivel");
  const pontosEl = document.getElementById("pontos");
  const barra = document.getElementById("barraProgresso");

  pontosEl.innerText = `Pontos: ${pontosTotais}`;

  let nivel = "Iniciante 🌱";
  let progresso = pontosTotais;

  if (pontosTotais >= 100) {
    nivel = "Consciente ♻️";
    progresso = pontosTotais - 100;
  }
  if (pontosTotais >= 300) {
    nivel = "Sustentável 🌍";
    progresso = pontosTotais - 300;
  }
  if (pontosTotais >= 600) {
    nivel = "Mestre 🏆";
    progresso = pontosTotais - 600;
  }

  nivelEl.innerText = `Nível: ${nivel}`;

  let porcentagem = (progresso / 100) * 100;
  if (porcentagem > 100) porcentagem = 100;

  barra.style.width = porcentagem + "%";
}