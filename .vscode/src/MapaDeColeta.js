// ✅ FOTO DO USUÁRIO
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
  