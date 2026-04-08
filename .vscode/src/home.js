const email = localStorage.getItem("usuarioEmail");

if (!email) {
  // 🚫 não está logado
  window.location.href = "login.html";
} else {

  // ✅ só executa se tiver logado
  fetch("http://localhost:8000/dados-usuario", {
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
  .catch(() => {
    console.log("Erro ao buscar dados");
  });

}

function logout() {
  localStorage.removeItem("usuarioEmail"); // apaga quem está logado
  window.location.href = "login.html"; // volta pro login
}