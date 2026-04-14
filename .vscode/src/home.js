// 1. TENTA LER o email que deveria estar salvo
const email = localStorage.getItem('usuarioEmail'); 

// 2. VERIFICAÇÃO: Se não houver email, ele te chuta para fora na hora
if (!email || email === "undefined" || email === null) {
    console.log("Acesso negado! Redirecionando...");
    // Redireciona para a rota pública; o vercel.json faz o rewrite internamente
    window.location.href = "/homeNaoLogado.html";
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