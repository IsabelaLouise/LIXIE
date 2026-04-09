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

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

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

  function validarEmailFormato() {
    const valor = email.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(valor)) {
      mostrarErro(email, "erro-email", "Email inválido");
      return false;
    }

    sucessoInput(email, "erro-email");
    return true;
  }

  function validarSenha() {
    const valor = senha.value;
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

    let valido = true;

    if (!regex.test(valor)) {
      mostrarErro(senha, "erro-senha", "Senha fraca");
      valido = false;
    } else {
      sucessoInput(senha, "erro-senha");
    }

    if (valor !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "Senhas não coincidem");
      valido = false;
    } else {
      sucessoInput(confirmarSenha, "erro-confirmar");
    }

    return valido;
  }

  function exibirPassoSenha() {
    stepEmail.classList.remove("active");
    stepSenha.classList.add("active");
  }

  // 🔥 SE VEIO DO EMAIL (com token)
  if (token) {
    mostrarMensagem("Link válido! Defina sua nova senha.", "sucesso");
    exibirPassoSenha();
  }

  // 🔥 ENVIAR EMAIL DE RECUPERAÇÃO
  btnConfirmarEmail.addEventListener("click", function () {
    limparErros();

    if (!validarEmailFormato()) return;

    fetch("http://localhost:8000/esqueci-senha", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `email=${encodeURIComponent(email.value)}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.sucesso) {
        mostrarMensagem("Email enviado! Verifique sua caixa de entrada.", "sucesso");
      } else {
        mostrarErro(email, "erro-email", data.mensagem || "Email não encontrado");
      }
    })
    .catch(() => {
      mostrarMensagem("Erro no servidor", "erro");
    });
  });

  // 🔥 ALTERAR SENHA COM TOKEN (CORRIGIDO)
  btnAlterarSenha.addEventListener("click", function () {
    limparErros();

    if (!token) {
      mostrarMensagem("Token inválido ou ausente", "erro");
      return;
    }

    if (!validarSenha()) return;

    fetch("http://localhost:8000/redefinir-com-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `token=${encodeURIComponent(token)}&senha=${encodeURIComponent(senha.value)}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.sucesso) {
        mostrarMensagem("Senha alterada com sucesso!", "sucesso");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);

      } else {
        mostrarMensagem(data.mensagem || "Erro ao alterar senha", "erro");
      }
    })
    .catch(() => {
      mostrarMensagem("Erro no servidor", "erro");
    });
  });

  // UI senha dinâmica
  senha.addEventListener("input", function () {
    const valor = senha.value;
    const requisitos = document.getElementById("requisitosSenha");

    requisitos.style.display = valor.length > 0 ? "block" : "none";

    const atualiza = (id, valido) => {
      const el = document.getElementById(id);
      if (!el) return;

      const textoBase = el.textContent.replace(/^(?:[❌✔️]\s*)+/, "").trim();

      if (valido) {
        el.classList.add("ok");
        el.textContent = "✔️ " + textoBase;
      } else {
        el.classList.remove("ok");
        el.textContent = "❌ " + textoBase;
      }
    };

    atualiza("req-maiuscula", /[A-Z]/.test(valor));
    atualiza("req-minuscula", /[a-z]/.test(valor));
    atualiza("req-numero", /[0-9]/.test(valor));
    atualiza("req-especial", /[!@#$%^&*]/.test(valor));
    atualiza("req-tamanho", valor.length >= 8);
  });

  confirmarSenha.addEventListener("input", function () {
    if (senha.value !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "Senhas não coincidem");
    } else {
      sucessoInput(confirmarSenha, "erro-confirmar");
    }
  });

});

// toggle senha
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