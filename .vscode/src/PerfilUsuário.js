let fotoPerfil= document.getElementById('avatar');
let inputFoto = document.getElementById('foto-perfil');

inputFoto.onchange =  function(){
    fotoPerfil.src = URL.createObjectURL(inputFoto.files[0]);
}

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("formPerfil");

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const tel = document.getElementById("tel");
  const data = document.getElementById("dataNascimento");

  const cep = document.getElementById("cep");
  const rua = document.getElementById("rua");
  const cidade = document.getElementById("cidade");
  const estado = document.getElementById("estado");

  const num = document.getElementById("num");

  const senha = document.getElementById("senha");

  // =========================
  // FUNÇÕES AUXILIARES
  // =========================
  function mostrarErro(input, idErro, mensagem) {
    input.classList.remove("sucesso");
    input.classList.add("erro");

    const erro = document.getElementById(idErro);
    if (erro) {
      erro.textContent = mensagem;
      erro.classList.add("ativo");
    }
  }

  function sucessoInput(input, idErro) {
    input.classList.remove("erro");
    input.classList.add("sucesso");

    const erro = document.getElementById(idErro);
    if (erro) erro.classList.remove("ativo");
  }

  // =========================
  // VALIDAÇÕES
  // =========================

  function validarNome() {
    if (nome.value.trim().length < 6) {
      mostrarErro(nome, "erro-nome", "Mínimo 6 caracteres");
      return false;
    }
    sucessoInput(nome, "erro-nome");
    return true;
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

  function validarTelefone() {
    const digits = tel.value.replace(/\D/g, "");

    if (digits.length < 10) {
      mostrarErro(tel, "erro-tel", "Telefone inválido");
      return false;
    }

    sucessoInput(tel, "erro-tel");
    return true;
  }

  function validarCep() {
    const valor = cep.value.replace(/\D/g, "");

    if (valor.length !== 8) {
      mostrarErro(cep, "erro-cep", "CEP deve ter 8 dígitos");
      return false;
    }

    if (!rua.value || !cidade.value || !estado.value) {
      mostrarErro(cep, "erro-cep", "CEP inválido");
      return false;
    }

    sucessoInput(cep, "erro-cep");
    return true;
  }

  function validarNumeroCasa() {
    if (num.value.trim() === "") {
      mostrarErro(num, "erro-num", "Informe o número");
      return false;
    }

    sucessoInput(num, "erro-num");
    return true;
  }

  // =========================
  // EVENTOS (TEMPO REAL)
  // =========================

  nome.addEventListener("input", validarNome);
  email.addEventListener("input", validarEmail);
  tel.addEventListener("input", validarTelefone);

  // Formatação telefone
  tel.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 2) v = "(" + v.slice(0, 2) + ") " + v.slice(2);
    if (v.length > 10) v = v.slice(0, 10) + "-" + v.slice(10);

    e.target.value = v;
  });

  // CEP
  cep.addEventListener("blur", async () => {
    const valor = cep.value.replace(/\D/g, "");

    rua.value = "";
    cidade.value = "";
    estado.value = "";

    if (valor.length !== 8) {
      mostrarErro(cep, "erro-cep", "CEP inválido");
      return;
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
      const dataCep = await res.json();

      if (dataCep.erro) {
        mostrarErro(cep, "erro-cep", "CEP não encontrado");
        return;
      }

      rua.value = dataCep.logradouro;
      cidade.value = dataCep.localidade;
      estado.value = dataCep.uf;

      sucessoInput(cep, "erro-cep");

    } catch {
      mostrarErro(cep, "erro-cep", "Erro ao buscar CEP");
    }
  });

  // =========================
  // SUBMIT
  // =========================

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const valido =
      validarNome() &&
      validarEmail() &&
      validarTelefone() &&
      validarCep() &&
      validarNumeroCasa();

    if (!valido) {
      alert("Preencha os campos corretamente");
      return;
    }

    alert("Perfil atualizado com sucesso 🚀");
  });

});