document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formEsqueci");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  const stepEmail = document.getElementById("step-email");
  const stepSenha = document.getElementById("step-senha");
  const btnConfirmarEmail = document.getElementById("btnConfirmarEmail");
  const btnAlterarSenha = document.getElementById("btnAlterarSenha");
  const mensagem = document.getElementById("mensagem");

  function mostrarErro(input, erroId, texto) {
    input.classList.remove("sucesso");
    input.classList.add("erro");
    const erroEl = document.getElementById(erroId);
    erroEl.textContent = texto;
    erroEl.classList.add("ativo");
  }

  function sucessoInput(input, erroId) {
    input.classList.remove("erro");
    input.classList.add("sucesso");
    const erroEl = document.getElementById(erroId);
    if (erroEl) erroEl.classList.remove("ativo");
  }

  function limparErros() {
    document.querySelectorAll(".erro-texto").forEach(el => {
      el.textContent = "";
      el.classList.remove("ativo");
    });
    document.querySelectorAll("input").forEach(input => {
      input.classList.remove("erro", "sucesso");
    });
  }

  function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;
    mensagem.style.display = "block";
    setTimeout(() => {
      mensagem.style.display = "none";
    }, 3500);
  }

  function validarEmail() {
    const valor = email.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(valor)) {
      mostrarErro(email, "erro-email", "Email inválido");
      return false;
    }

    const emailCadastrado = localStorage.getItem("cadastroEmail");
    if (emailCadastrado) {
      if (valor.toLowerCase() !== emailCadastrado.toLowerCase()) {
        mostrarErro(email, "erro-email", "Email não encontrado no cadastro");
        return false;
      }
    }

    sucessoInput(email, "erro-email");
    return true;
  }

  function validarSenha() {
    const valor = senha.value;
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    let valido = true;

    if (!regex.test(valor)) {
      mostrarErro(senha, "erro-senha", "Senha deve ter maiúscula, minúscula, número e especial");
      valido = false;
    } else {
      sucessoInput(senha, "erro-senha");
    }

    if (valor !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "As senhas não coincidem");
      valido = false;
    } else if (confirmarSenha.value.length > 0) {
      sucessoInput(confirmarSenha, "erro-confirmar");
    }

    return valido;
  }

  function exibirPassoSenha() {
    stepEmail.classList.remove("active");
    stepSenha.classList.add("active");
  }

  btnConfirmarEmail.addEventListener("click", function () {
    limparErros();
    if (!validarEmail()) return;

    const emailCadastrado = localStorage.getItem("cadastroEmail");
    if (!emailCadastrado) {
      mostrarMensagem("Nenhum cadastro local encontrado, prosseguir como modo de demonstração.", "erro");
    } else {
      mostrarMensagem("Email encontrado. Informe a nova senha.", "sucesso");
    }

    exibirPassoSenha();
  });

  senha.addEventListener("input", function () {
    const valor = senha.value;
    const requisitos = document.getElementById("requisitosSenha");
    requisitos.style.display = valor.length > 0 ? "block" : "none";

    const maiuscula = /[A-Z]/.test(valor);
    const minuscula = /[a-z]/.test(valor);
    const numeroValido = /[0-9]/.test(valor);
    const especial = /[!@#$%^&*]/.test(valor);
    const tamanho = valor.length >= 8;

    const atualiza = (id, valido) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (valido) {
        el.classList.add("ok");
        el.textContent = "✔️ " + el.textContent.replace(/^❌\s*/, "");
      } else {
        el.classList.remove("ok");
        el.textContent = "❌ " + el.textContent.replace(/^✔️\s*/, "");
      }
    };

    atualiza("req-maiuscula", maiuscula);
    atualiza("req-minuscula", minuscula);
    atualiza("req-numero", numeroValido);
    atualiza("req-especial", especial);
    atualiza("req-tamanho", tamanho);
  });

  confirmarSenha.addEventListener("input", function () {
    if (senha.value !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "As senhas não coincidem");
    } else {
      sucessoInput(confirmarSenha, "erro-confirmar");
    }
  });

  btnAlterarSenha.addEventListener("click", function () {
    limparErros();
    if (!validarSenha()) return;
    mostrarMensagem("Senha alterada com sucesso!", "sucesso");
    form.reset();
    stepSenha.classList.remove("active");
    stepEmail.classList.add("active");
    document.getElementById("requisitosSenha").style.display = "none";
  });
});

function toggleSenha(id, elemento) {
  const input = document.getElementById(id);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    elemento.textContent = "🔓";
  } else {
    input.type = "password";
    elemento.textContent = "🔒";
  }
}
