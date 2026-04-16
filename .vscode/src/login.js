document.getElementById("formLogin").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");
  const overlayErroLogin = document.getElementById("mensagem-erro-login");

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
      // Mostrar overlay bonitinho (como no PerfilUsuario)
      try {
        if (overlayErroLogin) {
          // garante que o overlay fique como filho do body para sobrepor dialogs
          if (overlayErroLogin.parentNode !== document.body) document.body.appendChild(overlayErroLogin);
          overlayErroLogin.style.zIndex = '99999';
          // apenas alterna a classe ativo; o CSS garante position:fixed e não empurra a página
          overlayErroLogin.classList.add('ativo');
          setTimeout(() => {
            overlayErroLogin.classList.remove('ativo');
          }, 2000);
        } else {
          // fallback simples para o box de mensagem padrão
          mensagem.textContent = dados.mensagem || 'Email e/ou senha incorreto(s)';
          mensagem.className = 'mensagem erro';
          mensagem.style.display = 'block';
          setTimeout(() => { mensagem.style.display = 'none'; }, 2000);
        }
      } catch (e) {
        mensagem.textContent = dados.mensagem || 'Email e/ou senha incorreto(s)';
        mensagem.className = 'mensagem erro';
        mensagem.style.display = 'block';
      }
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