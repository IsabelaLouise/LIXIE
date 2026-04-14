document.getElementById("formLogin").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");

  try {
    const resposta = await fetch("https://lixie-production.up.railway.app/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`
    });

    const dados = await resposta.json();

    if (dados.sucesso) {
      localStorage.setItem("email", email);
      window.location.href = "/.vscode/src/homeLogado.html";
    } else {
      mensagem.textContent = dados.mensagem;
      mensagem.style.display = "block";
    }

  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor";
    mensagem.style.display = "block";
  }
});


// 👇 FORA DO EVENTO (IMPORTANTE)
function toggleSenhaLogin(elemento) {
  console.log("clicou");

  const input = document.getElementById("senha");

  if (input.type === "password") {
    input.type = "text";
    elemento.classList.remove("fa-eye");
    elemento.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    elemento.classList.remove("fa-eye-slash");
    elemento.classList.add("fa-eye");
  }
}