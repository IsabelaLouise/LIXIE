document.getElementById("formLogin").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");
  const overlayErroLogin = document.getElementById("mensagem-erro-login");

  
  localStorage.setItem("logado", "true");
  localStorage.setItem("ultimoAcesso", Date.now());

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
      localStorage.setItem("permissao", dados.permissao); // 👈 NOVO

      window.location.href = "/.vscode/src/homeLogado.html";
    }else {
      // Sempre mostrar a mensagem simples e visível (mais robusto em deploy)
      const texto = dados.mensagem || 'Email e/ou senha incorreto(s)';
      mensagem.textContent = texto;
      mensagem.className = 'mensagem erro';
      mensagem.style.display = 'block';

      // também aciona o overlay se existir (opcional)
      try {
        if (overlayErroLogin) {
          if (overlayErroLogin.parentNode !== document.body) document.body.appendChild(overlayErroLogin);
          overlayErroLogin.style.zIndex = '99999';
          overlayErroLogin.classList.add('ativo');
          setTimeout(() => overlayErroLogin.classList.remove('ativo'), 2000);
        }
      } catch (e) {
        // ignore
      }

      // esconde a mensagem padrão após 2s
      setTimeout(() => { mensagem.style.display = 'none'; }, 2000);
    }

  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor";
    mensagem.style.display = "block";
  }
});

function logout() {
    localStorage.clear();
    window.location.href = "homeNaoLogado.html";
}

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

localStorage.setItem("logado", "true");