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
    input.classList.remove("sucesso");
    input.classList.add("erro");

    const campoErro = document.getElementById(idErro);
    campoErro.textContent = mensagem;
    campoErro.style.display = "block";
  }

  function sucessoInput(input, iconId) {
    input.classList.remove("erro");
    input.classList.add("sucesso");

    const icon = document.getElementById(iconId);
    if (icon) icon.textContent = "✅";

    const erro = document.getElementById("erro-" + input.id.replace("confirmarSenha","confirmar"));
    if (erro) erro.style.display = "none";
  }

  function limparCampo(input, idErro, iconId) {
    input.classList.remove("erro", "sucesso");

    const erro = document.getElementById(idErro);
    if (erro) erro.style.display = "none";

    const icon = document.getElementById(iconId);
    if (icon) icon.textContent = "";
  }

  function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");

    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;

    setTimeout(() => {
      mensagem.style.display = "none";
    }, 3000);
  }

  // ===== VALIDAÇÃO EM TEMPO REAL =====

  nome.addEventListener("input", () => {
    if (nome.value.trim().length < 6) {
      mostrarErro(nome, "erro-nome", "Mínimo de 6 caracteres");
    } else {
      sucessoInput(nome, "icon-nome");
    }
  });

  email.addEventListener("input", () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email.value)) {
      mostrarErro(email, "erro-email", "Email inválido");
    } else {
      sucessoInput(email, "icon-email");
    }
  });

  senha.addEventListener("input", () => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;

    if (!regex.test(senha.value)) {
      mostrarErro(senha, "erro-senha", "Senha fraca");
    } else {
      sucessoInput(senha, "icon-senha");
    }
  });

  confirmarSenha.addEventListener("input", () => {
    if (senha.value !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "As senhas não coincidem");
    } else {
      sucessoInput(confirmarSenha, "icon-confirmar");
    }
  });

  cepInput.addEventListener("input", () => {
    let cep = cepInput.value.replace(/\D/g, "");

    if (cep.length === 8) {
      sucessoInput(cepInput, "icon-cep");
    } else {
      mostrarErro(cepInput, "erro-cep", "CEP inválido");
    }
  });

  // ===== CEP API =====
  cepInput.addEventListener("blur", async () => {
    let cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) return;

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

  // ===== SUBMIT =====
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (
      nome.value.trim().length >= 6 &&
      email.value.includes("@") &&
      senha.value.length >= 6 &&
      senha.value === confirmarSenha.value
    ) {
      mostrarMensagem("Cadastrado com sucesso 🚀", "sucesso");

      form.reset();
      ruaInput.value = "";

      document.querySelectorAll("span[id^='icon']").forEach(i => i.textContent = "");
    }
  });

});

// ===== TOGGLE SENHA =====
function toggleSenha(id, elemento) {
  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
    elemento.textContent = "🔓";
  } else {
    input.type = "password";
    elemento.textContent = "🔒";
  }
}