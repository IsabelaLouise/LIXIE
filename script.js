document.addEventListener("DOMContentLoaded", function() {

  // ===== INPUTS =====
const form = document.getElementById("formCadastro");
const nome = document.getElementById("nome");
const data = document.getElementById("data_nasc");
const numero = document.getElementById("numero");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");
const cepInput = document.getElementById("cep");
const ruaInput = document.getElementById("rua");

  // ===== CEP AUTOMÁTICO =====
cepInput.addEventListener("blur", async () => {
    let cep = cepInput.value.replace(/\D/g, "");

    if (cep.length !== 8) {
        alert("CEP inválido");
        return;
    }

    try {
        let response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        let data = await response.json();

        if (data.erro) {
            alert("CEP não encontrado");
            return;
        }

        ruaInput.value = data.logradouro;

    } catch (error) {
        alert("Erro ao buscar CEP");
        console.log(error);
    }
});
  // ===== MÁSCARA DATA =====
data.addEventListener("input", function(e) {
    let v = e.target.value;
    v = v.replace(/\D/g, "");

    if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0,5) + "/" + v.slice(5,9);

    e.target.value = v;
});

  // ===== MÁSCARA TELEFONE =====
numero.addEventListener("input", function(e) {
    let v = e.target.value;
    v = v.replace(/\D/g, "");

    if (v.length > 2) v = "(" + v.slice(0,2) + ") " + v.slice(2);
    if (v.length > 10) v = v.slice(0,10) + "-" + v.slice(10,15);

    e.target.value = v;
});

  // ===== VALIDAÇÃO =====
form.addEventListener("submit", function(e) {
    e.preventDefault();
    // 🔴 CEP (validação)
    const cep = document.getElementById("cep").value.replace(/\D/g, "");

    if (cep.length !== 8) {
        alert("CEP inválido");
        e.preventDefault();
    return;
    }

    // 🔴 NOME (mín 6 letras)
    if (nome.value.trim().length < 6) {
        alert("Nome deve ter no mínimo 6 caracteres");
        e.preventDefault();
        return;
    }

    // 🔴 DATA (mín 16, máx 30, não pode ser futuro)
    const partes = data.value.split("/");

    if (partes.length !== 3) {
        alert("Data inválida");
        e.preventDefault();
        return;
    }

    const nascimento = new Date(partes[2], partes[1] - 1, partes[0]);
    const hoje = new Date();

    // ❌ FUTURO
    if (nascimento > hoje) {
        alert("Data não pode ser no futuro");
        e.preventDefault();
        return;
    }

    // cálculo idade
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    // ❌ < 16
    if (idade < 16) {
        alert("Você precisa ter pelo menos 16 anos");
        e.preventDefault();
        return;
    }

    // ❌ > 30
    if (idade > 120) {
        alert("Idade máxima é 120 anos");
        e.preventDefault();
        return;
    }



    // 🔴 EMAIL (estrutura básica)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        alert("Email inválido");
        e.preventDefault();
        return;
    }

    const senhaRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$/;
    if (!senhaRegex.test(senha.value)) {
        alert("Senha deve ter no mínimo 6 caracteres, um número e um caractere especial");
        e.preventDefault();
        return;
    }

    // 🔴 CONFIRMAR SENHA
    if (senha.value !== confirmarSenha.value) {
        alert("As senhas não coincidem");
        e.preventDefault();
        return;
    }

    alert("Cadastrado(a)! 🚀");

    form.reset();
    ruaInput.value = "";
    });
});
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