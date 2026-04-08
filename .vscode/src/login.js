document.getElementById("formLogin").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");

  try {
    const resposta = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
      window.location.href = "homePrincipal.html";
    } else {
      mensagem.textContent = dados.mensagem;
      mensagem.style.display = "block";
    }

  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor";
    mensagem.style.display = "block";
  }
});