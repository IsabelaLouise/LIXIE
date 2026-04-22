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
  const cidadeInput = document.getElementById("cidade");
  const estadoInput = document.getElementById("estado");
  const numeroCasa = document.getElementById("numeroCasa");
  const complemento = document.getElementById("complemento");
  const pages = document.querySelectorAll(".form-page");
  const steps = document.querySelectorAll(".stepper .step");
  let currentPage = 0;
  // flag para ignorar verificações de email quando estamos no fluxo de sucesso
  let ignoreEmailChecks = false;

  
  async function verificarEmailExistente() {
  const emailValor = email.value.trim();
  console.log("Verificando email:", emailValor);

  if (ignoreEmailChecks) {
    // durante o fluxo de sucesso (após criar conta) não queremos mostrar "email já cadastrado" por chamadas pendentes
    console.log("Verificação de email ignorada por flag (fluxo de sucesso).");
    return false;
  }

  
  try {
    const formData = new URLSearchParams();
    formData.append("email", emailValor);

    const resposta = await fetch("https://lixie-production.up.railway.app/verificar-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    },
      body: formData
    });

    const dados = await resposta.json();
    console.log("Resposta do servidor:", dados);
    
    if (dados.existe) {
      mostrarErro(email, "erro-email", "Essa conta já existe!");
      return true; // existe
    }

    return false; // não existe

  } catch (e) {
    console.log("Erro", e);
    mostrarMensagem("❌ Erro ao verificar email!", "erro");
    return true // bloqueia por segurança
  }
}

  function mostrarErro(input, idErro, mensagem) {
    input.classList.remove("sucesso");
    input.classList.add("erro");

    const campoErro = document.getElementById(idErro);
    campoErro.textContent = mensagem;
    campoErro.classList.add("ativo");
  }

  function sucessoInput(input, idErro) {
    input.classList.remove("erro");
    input.classList.add("sucesso");

    const erro = document.getElementById(idErro);
    if (erro) erro.classList.remove("ativo");
  }

  function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");

    mensagem.textContent = texto;
    mensagem.className = "mensagem " + tipo;
    mensagem.style.display = "block";

    setTimeout(() => {
      mensagem.style.display = "none";
    }, 3000);
  }

  function atualizarReq(id, valido) {
    const el = document.getElementById(id);

    if (!el) return;

    if (valido) {
      el.classList.add("ok");
      el.textContent = "✔️ " + el.textContent.replace("❌ ", "").replace("✔️ ", "");
    } else {
      el.classList.remove("ok");
      el.textContent = "❌ " + el.textContent.replace("✔️ ", "").replace("❌ ", "");
    }
  }

  function mostrarPagina(index) {
    pages.forEach((page, idx) => {
      page.classList.toggle("active", idx === index);
    });

    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx === index);
      step.classList.toggle("completed", idx < index);
    });
  }

  function validarEmail() {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email.value.trim())) {
      mostrarErro(email, "erro-email", "Email inválido");
      return false;
    }
    sucessoInput(email, "erro-email");
    return true;
  }

  function validarData() {
    const dataValor = data.value.trim();
    const partes = dataValor.split("/");

    if (partes.length !== 3) {
      mostrarErro(data, "erro-data", "Data inválida");
      return false;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const ano = Number(partes[2]);
    const hoje = new Date();
    const nascimento = new Date(ano, mes - 1, dia);
    const idade = hoje.getFullYear() - ano - (hoje.getMonth() < mes - 1 || (hoje.getMonth() === mes - 1 && hoje.getDate() < dia) ? 1 : 0);

    const dataValida = nascimento.getFullYear() === ano && nascimento.getMonth() === mes - 1 && nascimento.getDate() === dia;
    if (!dataValida) {
      mostrarErro(data, "erro-data", "Data inválida");
      return false;
    }

    if (nascimento > hoje) {
      mostrarErro(data, "erro-data", "Data no futuro não é permitida");
      return false;
    }

    if (idade < 16) {
      mostrarErro(data, "erro-data", "Você precisa ter pelo menos 16 anos");
      return false;
    }

    if (idade > 120) {
      mostrarErro(data, "erro-data", "Idade inválida");
      return false;
    }

    sucessoInput(data, "erro-data");
    return true;
  }

  function validarDadosPessoais() {
    let valido = true;

    if (nome.value.trim().length < 6) {
      mostrarErro(nome, "erro-nome", "O nome deve conter ao menos 6 caracteres");
      valido = false;
    } else {
      sucessoInput(nome, "erro-nome");
    }

    if (!validarData()) {
      valido = false;
    }

    if (numero.value.replace(/\D/g, "").length < 10) {
      mostrarErro(numero, "erro-numero", "Telefone inválido");
      valido = false;
    } else {
      sucessoInput(numero, "erro-numero");
    }

    return valido;
  }

  function validarCepPagina() {
    const cep = cepInput.value.replace(/\D/g, "");
    if (cep.length !== 8) {
      mostrarErro(cepInput, "erro-cep", "CEP deve ter 8 dígitos");
      return false;
    }

    if (!ruaInput.value.trim() || !cidadeInput.value.trim() || !estadoInput.value.trim()) {
      mostrarErro(cepInput, "erro-cep", "Informe um CEP válido para preencher o endereço");
      return false;
    }

    sucessoInput(cepInput, "erro-cep");
    return true;
  }

  function validarSenhaPagina() {
    const valor = senha.value;
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

    if (!regex.test(valor)) {
      mostrarErro(senha, "erro-senha", "Senha deve ter maiúscula, minúscula, número e especial");
      return false;
    }

    sucessoInput(senha, "erro-senha");

    if (senha.value !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "As senhas não coincidem");
      return false;
    }

    sucessoInput(confirmarSenha, "erro-confirmar");
    return true;
  }

  function irParaProximaPagina() {
    const validacoes = [validarEmail, validarDadosPessoais, validarCepPagina, validarSenhaPagina];
    if (validacoes[currentPage] && validacoes[currentPage]()) {
      if (currentPage < pages.length - 1) {
        currentPage += 1;
        mostrarPagina(currentPage);
      }
    }
  }

  function irParaPaginaAnterior() {
    if (currentPage > 0) {
      currentPage -= 1;
      mostrarPagina(currentPage);
    }
  }

  document.getElementById("page1Next").addEventListener("click", async () => {
    
    if (!validarEmail()) return; //valida
    const existe = await verificarEmailExistente(); //verifica
    if (existe) return; //bloqueia

    irParaProximaPagina();
});

  document.getElementById("page2Prev").addEventListener("click", irParaPaginaAnterior);
  document.getElementById("page2Next").addEventListener("click", irParaProximaPagina);
  document.getElementById("page3Prev").addEventListener("click", irParaPaginaAnterior);
  document.getElementById("page3Next").addEventListener("click", irParaProximaPagina);
  document.getElementById("page4Prev").addEventListener("click", irParaPaginaAnterior);

  nome.addEventListener("input", () => {
    const valor = nome.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    if (nome.value !== valor) {
      nome.value = valor;
    }

    const valorTrim = valor.trim();
    if (valorTrim.length === 0) {
      nome.classList.remove("erro", "sucesso");
      const erro = document.getElementById("erro-nome");
      erro.textContent = "";
      erro.classList.remove("ativo");
      return;
    }

    if (valorTrim.length < 6) {
      mostrarErro(nome, "erro-nome", "O nome deve ter pelo menos 6 caracteres e sem números");
    } else {
      sucessoInput(nome, "erro-nome");
    }
  });

// limpa quando o usuario erra
  email.addEventListener("input", () => {
  validarEmail();

  // limpa erro enquanto digita
  email.classList.remove("erro");
  const erro = document.getElementById("erro-email");
  erro.textContent = "";
  erro.classList.remove("ativo");
});

  email.addEventListener("blur", async () => {
    if (!validarEmail()) return;

    const existe = await verificarEmailExistente();

    if(!existe) {
      sucessoInput(email, "erro-email");
    }
  });


  data.addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);

    e.target.value = v;

    if (v.length === 0) {
      data.classList.remove("erro", "sucesso");
      const erro = document.getElementById("erro-data");
      erro.textContent = "";
      erro.classList.remove("ativo");
      return;
    }

    if (v.length === 10) {
      validarData();
    }
  });

  numero.addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 2) v = "(" + v.slice(0, 2) + ") " + v.slice(2);
    if (v.length > 10) v = v.slice(0, 10) + "-" + v.slice(10, 15);

    e.target.value = v;

    const digits = v.replace(/\D/g, "");
    if (digits.length === 0) {
      numero.classList.remove("erro", "sucesso");
      const erro = document.getElementById("erro-numero");
      erro.textContent = "";
      erro.classList.remove("ativo");
      return;
    }

    if (digits.length >= 10) {
      sucessoInput(numero, "erro-numero");
    }
  });

  senha.addEventListener("input", () => {
    const valor = senha.value;
    const requisitos = document.getElementById("requisitosSenha");

    requisitos.style.display = valor.length > 0 ? "block" : "none";

    const maiuscula = /[A-Z]/.test(valor);
    const minuscula = /[a-z]/.test(valor);
    const numeroValido = /[0-9]/.test(valor);
    const especial = /[!@#$%^&*]/.test(valor);
    const tamanho = valor.length >= 8;

    atualizarReq("req-maiuscula", maiuscula);
    atualizarReq("req-minuscula", minuscula);
    atualizarReq("req-numero", numeroValido);
    atualizarReq("req-especial", especial);
    atualizarReq("req-tamanho", tamanho);

    if (maiuscula && minuscula && numeroValido && especial && tamanho) {
      sucessoInput(senha, "erro-senha");
    } else {
      mostrarErro(senha, "erro-senha", "Senha não atende os requisitos");
    }
  });

  confirmarSenha.addEventListener("input", () => {
    if (senha.value !== confirmarSenha.value) {
      mostrarErro(confirmarSenha, "erro-confirmar", "As senhas não coincidem");
    } else {
      sucessoInput(confirmarSenha, "erro-confirmar");
    }
  });

  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, "");

    ruaInput.value = "";
    cidadeInput.value = "";
    estadoInput.value = "";

    if (cep.length !== 8) {
      mostrarErro(cepInput, "erro-cep", "CEP deve conter 8 números");
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dataCep = await response.json();

      if (dataCep.erro) {
        mostrarErro(cepInput, "erro-cep", "CEP não encontrado");
        return;
      }

      ruaInput.value = dataCep.logradouro;
      cidadeInput.value = dataCep.localidade;
      estadoInput.value = dataCep.uf;
      sucessoInput(cepInput, "erro-cep");
    } catch (error) {
      mostrarErro(cepInput, "erro-cep", "Erro ao buscar CEP");
    }
  });

  cepInput.addEventListener("input", () => {
    let digits = cepInput.value.replace(/\D/g, "");
    if (digits.length > 8) {
      digits = digits.slice(0, 8);
    }

    let formattedCep = digits;
    if (digits.length > 5) {
      formattedCep = digits.slice(0, 5) + "-" + digits.slice(5);
    }

    cepInput.value = formattedCep;
    ruaInput.value = "";
    cidadeInput.value = "";
    estadoInput.value = "";
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validarEmail() || !validarDadosPessoais() || !validarCepPagina() || !validarSenhaPagina()) {
      mostrarMensagem("Preencha os campos corretamente antes de enviar", "erro");
      return;
    }

    try {
      const formData = new URLSearchParams(new FormData(form));

      const resposta = await fetch("https://lixie-production.up.railway.app/cadastrar", {
        method: "POST",
        body: formData
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        localStorage.setItem('cadastroEmail', email.value.trim());
        // bloquear checagens de email que possam aparecer após o cadastro (evita aviso falso antes do redirect)
        ignoreEmailChecks = true;
        mostrarMensagem("Cadastrado com sucesso 🚀", "sucesso");
        form.reset();
        limparFormulario();
        currentPage = 0;
        mostrarPagina(currentPage);
        setTimeout(() => {
      window.location.href = "/login.html";
      }, 1500);
      } else {
        mostrarMensagem(dados.erro || "Erro ao cadastrar", "erro");
      }
    } catch (erro) {
      mostrarMensagem("Erro de conexão com o servidor ❌", "erro");
    }
  });

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

  mostrarPagina(currentPage);
});

function toggleSenha() {
  const senha = document.getElementById("senha");
  const confirmar = document.getElementById("confirmarSenha");

  const icones = document.querySelectorAll(".toggle-senha");

  const mostrando = senha.type === "text";

  if (mostrando) {
    senha.type = "password";
    confirmar.type = "password";

    icones.forEach(icon => {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    });

  } else {
    senha.type = "text";
    confirmar.type = "text";

    icones.forEach(icon => {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    });
  }
}

function limparFormulario() {
  const inputs = document.querySelectorAll("#formCadastro input");
  inputs.forEach(input => {
    input.classList.remove("sucesso", "erro");
  });

  const erros = document.querySelectorAll(".erro-texto");
  erros.forEach(e => {
    e.textContent = "";
    e.classList.remove("ativo");
  });

  const requisitos = document.getElementById("requisitosSenha");
  if (requisitos) requisitos.style.display = "none";

  const mensagem = document.getElementById("mensagem");
  mensagem.style.display = "none";
}