let tipoSelecionado = "";
let pontosTotais = 0;

document.getElementById("quantidade").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("cep").focus();
  }
});

// pontos por material (base em KG)
const pontosPorMaterial = {
  plastico: 10,
  papel: 4,
  vidro: 8,
  metal: 15,
  organico: 6
};

// converter para KG
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

  // CONVERSÃO CORRETA
  const quantidadeKg = converterParaKg(quantidade, unidade);

  // CÁLCULO CORRETO
  const pontos = Math.round(
    quantidadeKg * (pontosPorMaterial[tipoSelecionado] || 0)
  );

  pontosTotais += pontos;

  atualizarPainel();

  // mensagem final
  resultado.className = "sucesso";
  let mensagem = `
  ✅ Registrado com sucesso! <br>
  ♻️ Material: ${tipoSelecionado} <br>
  ⚖️ Quantidade: ${quantidade} ${unidade} <br>
`;

if (unidade !== "un") {
  mensagem += `📦 Equivalente: ${quantidadeKg.toFixed(2)} kg <br>`;
}

mensagem += `⭐ Pontos ganhos: ${pontos}`;

resultado.innerHTML = mensagem;

  // limpar formulário
  document.getElementById("quantidade").value = "";
  tipoSelecionado = "";
  document.querySelectorAll("#materiais button").forEach(b => b.classList.remove("ativo"));
});

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

let cepValido = false;

const cep = document.getElementById("cep");
const erroCep = document.getElementById("erroCep");

cep.addEventListener("input", async (e) => {

    let valor = e.target.value;

    // limpa
    valor = valor.replace(/\D/g, "");
    //limita
    valor = valor.slice(0, 8);
    // formata
    if (valor.length > 5) {
        valor = valor.slice(0, 5) + "-" + valor.slice(5);
    }

    e.target.value = valor;

    // cria o cep limpo
    const cepLimpo = valor.replace(/\D/g, "");

    cepValido = false;

    // SÓ entra quando tiver 8 dígitos
    if (cepLimpo.length === 8) {

    erroCep.className = "loading";
    erroCep.innerText = "🔄 Buscando CEP...";

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();

            if (data.erro) {
                erroCep.className = "erro";
                erroCep.innerText = "❌ CEP não encontrado!";
                cepValido = false;
                return;
            }

        e.target.value = `${data.logradouro} - ${data.localidade}`;

            erroCep.className = "sucesso";
            erroCep.innerText = "✅ CEP encontrado";

            cepValido = true;

        } catch {
            erroCep.className = "erro";
            erroCep.innerText = "❌ Erro ao buscar CEP";
            cepValido = false;
        }

    } else {
    // limpa mensagem se não tiver completo
         erroCep.innerText = "";
    }
});