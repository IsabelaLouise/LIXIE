document.addEventListener("DOMContentLoaded", function() {

  // Buscando elementos do formulário
const form = document.getElementById("formCadastro");
const nome = document.getElementById("nome");
const data = document.getElementById("data_nasc");
const numero = document.getElementById("numero");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");
const cepInput = document.getElementById("cep");
const ruaInput = document.getElementById("rua");

  // Automaticamente preencher o campo rua ao obter o CEP
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
  // Máscara para data (DD/MM/AAAA)
data.addEventListener("input", function(e) {
    let v = e.target.value;
    v = v.replace(/\D/g, "");

    if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
    if (v.length > 5) v = v.slice(0,5) + "/" + v.slice(5,9);

    e.target.value = v;
});

  // Máscara para telefone (XX) XXXXX-XXXX
numero.addEventListener("input", function(e) {
    let v = e.target.value;
    v = v.replace(/\D/g, "");

    if (v.length > 2) v = "(" + v.slice(0,2) + ") " + v.slice(2);
    if (v.length > 10) v = v.slice(0,10) + "-" + v.slice(10,15);

    e.target.value = v;
});

  // Validação do formulário
form.addEventListener("submit", function(e) {
    e.preventDefault();
    // CEP (Não pode ser vazio, deve ter 8 dígitos e só números)
    const cep = document.getElementById("cep").value.replace(/\D/g, "");

    if (cep.length !== 8) {
        alert("CEP inválido");
        e.preventDefault();
    return;
    }

    // Nome (mín 6 letras)
    if (nome.value.trim().length < 6) {
        alert("Nome deve ter no mínimo 6 caracteres");
        e.preventDefault();
        return;
    }

    // Data de Nascimento
    const partes = data.value.split("/");

    // Não tem 3 partes (DD/MM/AAAA)
    if (partes.length !== 3) {
        alert("Data inválida");
        e.preventDefault();
        return;
    }

    const nascimento = new Date(partes[2], partes[1] - 1, partes[0]);
    const hoje = new Date();

    // Pessoa não pode nascer no futuro
    if (nascimento > hoje) {
        alert("Data não pode ser no futuro");
        e.preventDefault();
        return;
    }

    // Cálculo da idade
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    // Não aceita menores de 16
    if (idade < 16) {
        alert("Você precisa ter pelo menos 16 anos");
        e.preventDefault();
        return;
    }

    // Não aceita maiores de 120
    if (idade > 120) {
        alert("Idade máxima é 120 anos");
        e.preventDefault();
        return;
    }

<<<<<<< HEAD:script.js
    // 🔴 EMAIL (estrutura básica)
=======


    // Email (verifica se tem "@", domínio e extensão)
>>>>>>> d6ace63021c77cce8a1f446c0be8cd1619b384cd:.vscode/src/script.js
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        alert("Email inválido");
        e.preventDefault();
        return;
    }

    // Senha (mín 8 caracteres, pelo menos 1 letra minúscula, 1 letra maiúscula, 1 número e 1 caractere especial)
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    if (!senhaRegex.test(senha.value)) {
        alert("Senha deve ter no mínimo 8 caracteres, uma letra minúscula, uma letra maiúscula, um número e um caractere especial");
        e.preventDefault();
        return;
    }

    // Confirmação de senha (deve ser igual à senha)
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

    // Função para mostrar/ocultar senha
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