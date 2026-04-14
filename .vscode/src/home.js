// 1. TENTA LER o email que deveria estar salvo
// home.js - ALTERE A PRIMEIRA LINHA
const email = localStorage.getItem('email'); // ✅ Agora coincide com o login.js

// O resto do código permanece igual
if (!email || email === "undefined" || email === null) {
    console.log("Acesso negado! Redirecionando...");
    window.location.href = "homeNaoLogado.html"; // Remova a / se estiver na mesma pasta
} else {
    // 3. SE ESTIVER LOGADO, busca os dados no Railway
    fetch("https://lixie-production.up.railway.app/dados-usuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(email)}`
    })
    .then(res => res.json())
    .then(dados => {
        document.getElementById("nome").textContent = dados.nome;
        document.getElementById("pontos").textContent = dados.pontos;
        document.getElementById("nivel").textContent = dados.nivel;
    })
    .catch(err => console.error("Erro ao conectar ao Railway:", err));
}

function logout() {
    localStorage.removeItem("usuarioEmail");
    window.location.href = "/homeNaoLogado.html";
}