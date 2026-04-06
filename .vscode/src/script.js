document.addEventListener("DOMContentLoaded", function () {

  // ELEMENTOS
  const form = document.getElementById("formCadastro");
  const nome = document.getElementById("nome");
  const data = document.getElementById("data_nasc");
  const numero = document.getElementById("numero");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  const cepInput = document.getElementById("cep");
  const ruaInput = document.getElementById("rua");

  // ================= FUNÇÕES =================

function mostrarErro(input, idErro, mensagem) {
  input.classList.remove("sucesso");
  input.classList.add("erro");

  const campoErro = document.getElementById(idErro);
  campoErro.textContent = mensagem;
  campoErro.classList.add("ativo"); // 👈 ESSENCIAL
}

function sucessoInput(input, idErro) {
  input.classList.remove("erro");
  input.classList.add("sucesso");

  const erro = document.getElementById(idErro);
  if (erro) erro.classList.remove("ativo"); // 👈 remove erro
}

  function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");

    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;

    setTimeout(() => {
      mensagem.style.display = "none";
    }, 3000);
  }

function atualizarReq(id, valido) {
  const el = document.getElementById(id);

  if (valido) {
    el.classList.add("ok");
    el.textContent = "✔️ " + el.textContent.replace("❌ ", "").replace("✔️ ", "");
  } else {
    el.classList.remove("ok");
    el.textContent = "❌ " + el.textContent.replace("✔️ ", "").replace("❌ ", "");
  }
}

  // ================= VALIDAÇÕES =================

  // NOME
  nome.addEventListener("input", () => {
  if (nome.value.trim().length < 6) {
    mostrarErro(nome, "erro-nome", "O nome deve ter pelo menos 6 caracteres");
  } else {
    sucessoInput(nome, "erro-nome");
  }
});

  // EMAIL
  email.addEventListener("input", () => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email.value)) {
      mostrarErro(email, "erro-email", "Email inválido");
    } else {
      sucessoInput(email, "erro-email");
    }
  });

  // DATA + VALIDAÇÃO REAL
data.addEventListener("input", function (e) {
  let v = e.target.value.replace(/\D/g, "");

  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);

  e.target.value = v;

  if (v.length === 10) {
    const [dia, mes, ano] = v.split("/").map(Number);
    const hoje = new Date();

    const dataDigitada = new Date(ano, mes - 1, dia);

    const idade = hoje.getFullYear() - ano;

    const dataValida =
      dataDigitada.getDate() === dia &&
      dataDigitada.getMonth() === mes - 1 &&
      dataDigitada.getFullYear() === ano;

    if (!dataValida) {
      mostrarErro(data, "erro-data", "Data inválida");
      return;
    }

    if (ano > hoje.getFullYear()) {
      mostrarErro(data, "erro-data", "Data no futuro não é permitida");
      return;
    }

    if (idade < 16) {
      mostrarErro(data, "erro-data", "Você precisa ter pelo menos 16 anos");
      return;
    }

    if (idade > 120) {
      mostrarErro(data, "erro-data", "Idade inválida");
      return;
    }

    sucessoInput(data, "erro-data");
  }
});

  // TELEFONE
  numero.addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 2) v = "(" + v.slice(0, 2) + ") " + v.slice(2);
    if (v.length > 10) v = v.slice(0, 10) + "-" + v.slice(10, 15);

    e.target.value = v;

    if (v.length >= 14) {
      sucessoInput(numero, "erro-numero");
    }
  });

  // SENHA DINÂMICA
  senha.addEventListener("input", () => {
    const valor = senha.value;
    const requisitos = document.getElementById("requisitosSenha");

    requisitos.style.display = valor.length > 0 ? "block" : "none";

    const maiuscula = /[A-Z]/.test(valor);
    const minuscula = /[a-z]/.test(valor);
    const numero = /[0-9]/.test(valor);
    const especial = /[!@#$%^&*]/.test(valor);
    const tamanho = valor.length >= 8;

    atualizarReq("req-maiuscula", maiuscula);
    atualizarReq("req-minuscula", minuscula);
    atualizarReq("req-numero", numero);
    atualizarReq("req-especial", especial);
    atualizarReq("req-tamanho", tamanho);

    if (maiuscula && minuscula && numero && especial && tamanho) {
      sucessoInput(senha, "erro-senha");
    } else {
      mostrarErro(senha, "erro-senha", "Senha não atende os requisitos");
    }
  });

  // CONFIRMAR SENHA
  confirmarSenha.addEventListener("input", () => {
    if (senha.value !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "As senhas não coincidem");
    } else {
      sucessoInput(confirmarSenha, "erro-confirmar");
    }
  });

  // CEP
cepInput.addEventListener("blur", async () => {
  let cep = cepInput.value.replace(/\D/g, "");

  // limpa campos antes de validar
  ruaInput.value = "";
  document.getElementById("cidade").value = "";
  document.getElementById("estado").value = "";

  if (cep.length !== 8) {
    mostrarErro(cepInput, "erro-cep", "CEP deve conter 8 números");
    return;
  }

  try {
    let response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    let dataCep = await response.json();

    if (dataCep.erro) {
      mostrarErro(cepInput, "erro-cep", "CEP não encontrado");
      return;
    }

    // preenche automaticamente
    ruaInput.value = dataCep.logradouro;
    document.getElementById("cidade").value = dataCep.localidade;
    document.getElementById("estado").value = dataCep.uf;

    // marca como sucesso (verde)
    sucessoInput(cepInput, "erro-cep");

  } catch (error) {
    mostrarErro(cepInput, "erro-cep", "Erro ao buscar CEP");
  }
});

//LIMPA O CEP DEPOIS
cepInput.addEventListener("input", () => {
  ruaInput.value = "";
  document.getElementById("cidade").value = "";
  document.getElementById("estado").value = "";
});

  // SUBMIT FINAL
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const valido =
      nome.classList.contains("sucesso") &&
      email.classList.contains("sucesso") &&
      data.classList.contains("sucesso") &&
      numero.classList.contains("sucesso") &&
      senha.classList.contains("sucesso") &&
      confirmarSenha.classList.contains("sucesso") &&
      cepInput.classList.contains("sucesso");

    if (valido) {
      mostrarMensagem("Cadastrado com sucesso 🚀", "sucesso");

      form.reset();
      ruaInput.value = "";
      document.getElementById("requisitosSenha").style.display = "none";

      document.querySelectorAll("input").forEach(i => {
        i.classList.remove("sucesso", "erro");
      });

    } else {
      mostrarMensagem("Preencha os campos corretamente ❌", "erro");
    }
  });

  // ================= ENTER = PRÓXIMO CAMPO =================
const campos = document.querySelectorAll("#formCadastro input");

campos.forEach((campo, index) => {
  campo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const proximo = campos[index + 1];

      if (proximo) {
        proximo.focus();
      }
    }
  });
});

});

// TOGGLE SENHA
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