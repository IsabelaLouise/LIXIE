// homeLogado.js (Privado)
const email = localStorage.getItem("usuarioEmail");

if (!email) {
  // 🚫 Se tentar entrar sem logar, vai para a página de entrada
  window.location.href = "/.vscode/src/cadastrese.html";
} else {
  // ✅ Busca dados reais no servidor do RAILWAY
  fetch("https://lixie-production.up.railway.app/dados-usuario", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `email=${encodeURIComponent(email)}`
  })
  .then(res => {
    if (!res.ok) throw new Error("Erro no servidor");
    return res.json();
  })
  .then(dados => {
    // Preenche os dados do usuário logado
    document.getElementById("nome").textContent = dados.nome;
    document.getElementById("pontos").textContent = dados.pontos;
    document.getElementById("nivel").textContent = dados.nivel;
  })
  .catch(err => {
    console.error("Erro ao buscar dados:", err);
  });
}

function logout() {
  localStorage.removeItem("usuarioEmail");
  window.location.href = "/.vscode/src/cadastrese.html";
}