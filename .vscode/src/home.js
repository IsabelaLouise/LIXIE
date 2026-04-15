// 1. TENTA LER o email que deveria estar salvo
// home.js - ALTERE A PRIMEIRA LINHA
const email = localStorage.getItem('email');

if (!email || email === "undefined" || email === null) {
    console.log("Acesso negado! Redirecionando...");
    window.location.href = "homeNaoLogado.html";
} else {

    // DADOS DO USUÁRIO
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

    // ✅ FOTO DO USUÁRIO (AGORA NO LUGAR CERTO)
    fetch("https://lixie-production.up.railway.app/perfil", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `email=${encodeURIComponent(email)}`
    })
    .then(res => res.json())
    .then(usuario => {
        const fotoHome = document.getElementById("fotoHome");

        if (usuario.foto && usuario.foto.trim().startsWith("http")) {
            fotoHome.src = usuario.foto.trim();
        } else {
            fotoHome.src = "img/avatar.png";
        }
    })
    .catch(err => console.error("Erro ao carregar foto:", err));
}


function logout() {
    localStorage.removeItem("usuarioEmail");
    window.location.href = "/homeNaoLogado.html";
}