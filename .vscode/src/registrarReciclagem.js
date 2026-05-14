document.addEventListener('DOMContentLoaded', () => {
  // MENU MOBILE TOGGLE (comum a ambas) - protegido por DOMContentLoaded
  const menuToggle = document.getElementById('menuToggle');
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle menu ao clicar no botão
  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }

  // Fechar menu ao clicar em um link
  if (navLinks && navLinks.length) {
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navbar) navbar.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
      });
    });
  }

  // Fechar menu ao redimensionar para desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      if (navbar) navbar.classList.remove('active');
      if (menuToggle) menuToggle.classList.remove('active');
    }
  });

  // FOTO DO USUÁRIO (se estiver logado)
  const email = localStorage.getItem('email');
  if (email) {
    fetch("http://localhost:8000/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `email=${encodeURIComponent(email)}`
    })
    .then(res => res.json())
    .then(usuario => {
      const fotoHome = document.getElementById("fotoHome");
      if (!fotoHome) return;
      if (usuario.foto && usuario.foto.trim().startsWith("http")) {
        fotoHome.src = usuario.foto.trim();
      } else {
        fotoHome.src = "img/avatar.png";
      }
    })
    .catch(err => console.error("Erro ao carregar foto:", err));
  }

  let tipoSelecionado = "";
  let pontosTotais = 0;
  let cepValido = false;

  // material e quantidade
  const quantidadeEl = document.getElementById("quantidade");
  if (quantidadeEl) {
    quantidadeEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        const quantidade = parseFloat(document.getElementById("quantidade").value);
        const resultado = document.getElementById("resultado");

        if (!tipoSelecionado) {
          if (resultado) {
            resultado.className = "erro";
            resultado.innerHTML =  "⚠️ Selecione um material primeiro!";
          }
          return;
        }

        if (!quantidade || quantidade <= 0) {
          if (resultado) {
            resultado.className = "erro";
            resultado.innerHTML = "⚠️ Digite uma quantidade válida!";
          }
          return;
        }

        if (resultado) {
          resultado.innerHTML = "";
          resultado.className = "";
        }

        const cepInput = document.getElementById("cep");
        if (cepInput) cepInput.focus();
        verificarPreenchimento();
      }
    });
  }

// pontos por material
const pontosPorMaterial = {
  plastico: 8,
  papel: 3,
  vidro: 6,
  metal: 15,
  organico: 7,
  pilhas: 10,
  eletronicos: 20,
  tampinha: 2,
  cartela: 5,
  capsula: 4,
};

// converter
function converterParaKg(valor, unidade) {
  switch (unidade) {
    case "g": return valor / 1000;
    case "kg": return valor;
    case "ton": return valor * 1000;
    case "un": return valor;
    default: return valor;
  }
}

// verificação de preenchimento
    function verificarPreenchimento() {
    const quantidade = parseFloat(document.getElementById("quantidade").value);

    if (tipoSelecionado === "" || !quantidade || quantidade <= 0) {
        const erroCep = document.getElementById("erroCep");
        if (erroCep) {
            erroCep.innerText = "";
            erroCep.className = "";
        }
    }
}


// selecionar material
document.querySelectorAll("#materiais button").forEach(btn => {
  btn.addEventListener("click", () => {
    tipoSelecionado = btn.dataset.tipo;

    document.querySelectorAll("#materiais button").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");

    verificarPreenchimento();
  });
});

// submit
document.getElementById("formReciclagem").addEventListener("submit", (e) => {
  e.preventDefault();

  const quantidade = parseFloat(document.getElementById("quantidade").value);
  const unidade = document.getElementById("unidade").value;
  const resultado = document.getElementById("resultado");
  const erroCep = document.getElementById("erroCep");

  resultado.innerHTML = "";
  resultado.className = "";
  erroCep.innerHTML = "";
  erroCep.className = "";

  // validações
  if (!tipoSelecionado) {
    resultado.className = "erro";
    resultado.innerHTML = "⚠️ Selecione um material!";
    return;
  }

  if (!quantidade || quantidade <= 0) {
    resultado.className = "erro";
    resultado.innerHTML = "⚠️ Digite uma quantidade válida!";
    return;
  }

  if (!cepValido) {
    erroCep.className = "erro";
    erroCep.innerHTML = "⚠️ Finalize o CEP antes de registrar";
    return;
  }

  // cálculo
  const quantidadeKg = converterParaKg(quantidade, unidade);

  const pontos = Math.round(
    quantidadeKg * (pontosPorMaterial[tipoSelecionado] || 0)
  );

  pontosTotais += pontos;

  atualizarPainel();

  // sucesso
  resultado.className = "sucesso";

  const email = localStorage.getItem("email");

fetch("http://localhost:8000/registrar-reciclagem",  {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: email,
    tipo: tipoSelecionado,
    quantidade: quantidade,
    unidade: unidade,
    pontos: pontos,
    cep: document.getElementById("cep").value
  })
})
.then(res => res.json())
.then(data => {
  console.log("SALVO NO BACK:", data);
})
.catch(err => {
  console.error("ERRO AO SALVAR:", err);
});


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
  resultado.style.display = "block";

  // limpar
  document.getElementById("quantidade").value = "";
  document.getElementById("cep").value = "";
  document.getElementById("foto").value = "";
  erroCep.innerText = "";
  erroCep.className = "";
  cepValido = false;
  tipoSelecionado = "";
  document.querySelectorAll("#materiais button").forEach(b => b.classList.remove("ativo"));
});

// painel
function atualizarPainel() {
  const nivelEl = document.getElementById("nivel");
  const pontosEl = document.getElementById("pontos");
  const barra = document.getElementById("barraProgresso");

  if (pontosEl) {
    pontosEl.innerText = `Pontos: ${pontosTotais}`;
  }

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

  if (nivelEl) {
    nivelEl.innerText = `Nível: ${nivel}`;
  }

  if (barra) {
    let porcentagem = (progresso / 100) * 100;
    if (porcentagem > 100) porcentagem = 100;
    barra.style.width = porcentagem + "%";
  }
}

// CEP
const cep = document.getElementById("cep");
const erroCep = document.getElementById("erroCep");

cep.addEventListener("input", async (e) => {

  let valor = e.target.value;

  valor = valor.replace(/\D/g, "");
  valor = valor.slice(0, 8);

  if (valor.length > 5) {
    valor = valor.slice(0, 5) + "-" + valor.slice(5);
  }

  e.target.value = valor;

  const cepLimpo = valor.replace(/\D/g, "");

  cepValido = false;

  if (cepLimpo.length === 8) {

    // erroCep.className = "loading";
    //erroCep.innerText = "🔄 Buscando CEP...";

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        erroCep.className = "erro";
        erroCep.innerText = "❌ CEP não encontrado!";
        return;
      }

      e.target.value = `${data.logradouro} - ${data.localidade}, ${data.uf}`;

     // erroCep.className = "sucesso";
     // erroCep.innerText = "✔️ CEP encontrado";

      cepValido = true;

    } catch {
      erroCep.className = "erro";
      erroCep.innerText = "❌ Erro ao buscar CEP";
    }

  } else {
    erroCep.innerText = "";
    erroCep.className = "";
  }
});

});

//para jogar para o cadastrese caso nao esteja logado
const logado = localStorage.getItem("logado");

if (logado !== "true") {
  window.location.href = "cadastrese.html"; 
}