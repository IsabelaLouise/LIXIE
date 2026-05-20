document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("formCadastro");

  const nome = document.getElementById("nome");
  const data = document.getElementById("data_nasc");
  const numero = document.getElementById("numero");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  const cepInput = document.getElementById("cep");
  const ruaInput = document.getElementById("rua");

  // ===== FUNÇÕES =====

  function mostrarErro(input, idErro, mensagem) {
    input.classList.add("erro");

    const campoErro = document.getElementById(idErro);
    campoErro.textContent = mensagem;
    campoErro.style.display = "block";
  }

  function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");

    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;

    // some sozinho
    setTimeout(() => {
      mensagem.style.display = "none";
    }, 3000);
  }

  function limparErros() {
    document.querySelectorAll("input").forEach(i => i.classList.remove("erro"));
    document.querySelectorAll(".erro-texto").forEach(e => {
      e.textContent = "";
      e.style.display = "none";
    });
  }

  // limpa ao digitar
  form.addEventListener("input", limparErros);

  cepInput.addEventListener("blur", async () => {
cepInput.addEventListener("blur", async () => {
    const dadosParaEnviar = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    senha: document.getElementById("senha").value,
    data_nasc: document.getElementById("data_nasc").value,
    rua: document.getElementById("rua").value,
    numeroCasa: document.getElementById("numero").value,
    cep: document.getElementById("cep").value.replace(/\D/g, ""),
    telefone: document.getElementById("numero").value 
};

fetch("http://localhost:8000/cadastrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosParaEnviar)
})
.then(res => res.json())
.then(data => alert(data.mensagem || data.erro))
.catch(err => console.error("Erro ao conectar:", err));

    let cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      mostrarErro(cepInput, "erro-cep", "CEP inválido");
      return;
    }

    try {
      let response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      let data = await response.json();

      if (data.erro) {
        mostrarErro(cepInput, "erro-cep", "CEP não encontrado");
        return;
      }

      ruaInput.value = data.logradouro;

    } catch (error) {
      mostrarErro(cepInput, "erro-cep", "Erro ao buscar CEP");
    }
  });

  // ===== MÁSCARA DATA =====
  data.addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);

    e.target.value = v;
  });

  // ===== MÁSCARA TELEFONE =====
  numero.addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 2) v = "(" + v.slice(0, 2) + ") " + v.slice(2);
    if (v.length > 10) v = v.slice(0, 10) + "-" + v.slice(10, 15);

    e.target.value = v;
  });

  // ===== VALIDAÇÃO =====
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    limparErros();

    const cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) {
      mostrarErro(cepInput, "erro-cep", "CEP inválido");
      return;
    }

    if (nome.value.trim().length < 6) {
      mostrarErro(nome, "erro-nome", "Nome deve ter no mínimo 6 caracteres");
      return;
    }

    const partes = data.value.split("/");

    if (partes.length !== 3) {
      mostrarErro(data, "erro-data", "Data inválida");
      return;
    }

    const nascimento = new Date(partes[2], partes[1] - 1, partes[0]);
    const hoje = new Date();

    if (nascimento > hoje) {
      mostrarErro(data, "erro-data", "Data não pode ser no futuro");
      return;
    }

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    if (idade < 16) {
      mostrarErro(data, "erro-data", "Você precisa ter pelo menos 16 anos");
      return;
    }

    if (idade > 120) {
      mostrarErro(data, "erro-data", "Idade máxima é 120 anos");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      mostrarErro(email, "erro-email", "Email inválido");
      return;
    }

    const senhaRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    if (!senhaRegex.test(senha.value)) {
      mostrarErro(senha, "erro-senha", "Senha fraca");
      return;
    }

    if (senha.value !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "As senhas não coincidem");
      return;
    }

    // ✅ SUCESSO
    mostrarMensagem("Cadastrado com sucesso 🚀", "sucesso");

    form.reset();
    ruaInput.value = "";
  });

});

  // ===== TOGGLE SENHA =====
  function toggleSenha(id, elemento) {
    const senha = document.getElementById("senha");
    const confirmarSenha = document.getElementById("confirmarSenha");

    // Verificar o estado atual baseado no campo senha
    const isPassword = senha.type === "password";

    // Alternar ambos os campos
    senha.type = isPassword ? "text" : "password";
    if (confirmarSenha) {
      confirmarSenha.type = isPassword ? "text" : "password";
    }

    // Atualizar todos os ícones de toggle para manter sincronia
    const toggles = document.querySelectorAll(".toggle-senha");
    toggles.forEach(t => t.textContent = isPassword ? "🔓" : "🔒");
  }

});

// ===== TIMEOUT =====
const TEMPO_MAXIMO = 0.1 * 60 * 1000; // 6 segundos em milissegundos
setInterval(verificarSessao, 10000); // verifica a cada 10s

function verificarSessao() {
    const logado = localStorage.getItem("logado");
    const ultimoAcesso = localStorage.getItem("ultimoAcesso");

    // Se não estiver logado → NÃO mostra modal
    if (logado !== "true") {
        return;
    }

    // Se não tem timestamp → cria um (primeiro acesso)
    if (!ultimoAcesso) {
        localStorage.setItem("ultimoAcesso", Date.now());
        return;
    }

    const agora = Date.now();
    const tempoParado = agora - ultimoAcesso;

    if (tempoParado > TEMPO_MAXIMO) {
        mostrarModalSessao();
    }
}

function tratarInteracao() {
    const logado = localStorage.getItem("logado");

    if (logado !== "true") return;

    const ultimoAcesso = localStorage.getItem("ultimoAcesso");

    if (!ultimoAcesso) {
        localStorage.setItem("ultimoAcesso", Date.now());
        return;
    }

    const agora = Date.now();
    const tempoParado = agora - ultimoAcesso;

    // verifica ANTES de atualizar
    if (tempoParado > TEMPO_MAXIMO) {
        mostrarModalSessao();
        return;
    }

    // só atualiza se ainda está válido
    localStorage.setItem("ultimoAcesso", Date.now());
}

function redirecionarLogin() {
    window.location.href = "/.vscode/src/login.html";
}

// eventos de atividade
document.addEventListener("click", tratarInteracao);
document.addEventListener("keydown", tratarInteracao);

// roda automaticamente
verificarSessao();

function mostrarModalSessao() {
    const modal = document.getElementById("sessionModal");

    if (modal) {
        modal.classList.add("active");
    }

    localStorage.clear();
}

function fecharModal() {
    window.location.href = "login.html";
}