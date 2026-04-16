let fotoPerfil = document.getElementById('avatar');
let inputFoto = document.getElementById('foto-perfil');

// Preview da foto assim que seleciona no celular/PC
inputFoto.onchange = function () {
    if (inputFoto.files[0]) {
        fotoPerfil.src = URL.createObjectURL(inputFoto.files[0]);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const mensagemNada = document.getElementById("mensagem-nada");
    const mensagem = document.getElementById("mensagem-sucesso");
    const form = document.getElementById("formPerfil");
    

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const tel = document.getElementById("tel");
    const data = document.getElementById("dataNascimento");
    const cep = document.getElementById("cep");
    const rua = document.getElementById("rua");
    const cidade = document.getElementById("cidade");
    const estado = document.getElementById("estado");
    const num = document.getElementById("num");
    const complemento = document.getElementById("complemento");
    let dadosOriginais = {};

    const modal = document.getElementById("popUp-apagar");
    const openBtn = document.getElementById("btn-apagar-conta");
    const closeBtn = document.getElementById("btn-fechar-modal");

    openBtn.addEventListener("click", () => modal.showModal()); 
    closeBtn.addEventListener("click", () => modal.close()); 

    // 🔥 PEGA EMAIL DO LOCALSTORAGE (Tenta as duas chaves possíveis)
    const emailUsuario = localStorage.getItem("email") || localStorage.getItem("usuarioEmail");

    // =========================
    // 1. BUSCAR DADOS DO BANCO (Ao carregar a página)
    // =========================
    if (emailUsuario) {
        try {
            const res = await fetch("https://lixie-production.up.railway.app/perfil", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `email=${encodeURIComponent(emailUsuario)}`
            });

            // No PerfilUsuario.js
            const usuario = await res.json();

            console.log(usuario); // 👈 COLOCA ISSO AQUI

            nome.value = usuario.nome || "";
            email.value = usuario.email || "";
            tel.value = usuario.telefone || ""; // Certifique-se que é .telefone
            data.value = usuario.dataNascimento || "";
            cep.value = usuario.cep || "";
            rua.value = usuario.rua || "";
            cidade.value = usuario.cidade || "";
            estado.value = usuario.estado || "";
            num.value = usuario.numero || "";   // Certifique-se que é .numero
            complemento.value = usuario.complemento || "";

            email.disabled = true; // Mantém email travado

            dadosOriginais = {
              nome: usuario.nome || "",
              telefone: usuario.telefone || "",
              cep: usuario.cep || "",
              rua: usuario.rua || "",
              cidade: usuario.cidade || "",
              estado: usuario.estado || "",
              numero: usuario.numero || "",
              complemento: usuario.complemento || ""
          };

                // ==========================================
    // CORREÇÃO EXCLUSIVA PARA A FOTO (PerfilUsuario.js)
    // ==========================================
    // Dentro do seu DOMContentLoaded, onde você recebe o "usuario" do banco:
    if (usuario.foto) {
        const urlLimpa = usuario.foto.trim();
        console.log("URL da foto vinda do banco:", urlLimpa);

        // Se a URL começar com http, ela veio do Cloudinary
        if (urlLimpa.startsWith('http')) {
            fotoPerfil.src = urlLimpa;
        } else {

            fotoPerfil.src = "https://lixie-production.up.railway.app/" + urlLimpa;
        }
    } else {
        fotoPerfil.src = "img/avatar.png"; 
    }

        } catch (erro) {
            console.error("Erro ao carregar perfil:", erro);
        }
    }

    // =========================
    // FUNÇÕES AUXILIARES E VALIDAÇÃO
    // =========================
    function mostrarErro(input, idErro, mensagem) {
        input.classList.remove("sucesso");
        input.classList.add("erro");
        const erro = document.getElementById(idErro);
        if (erro) {
            erro.textContent = mensagem;
            erro.classList.add("ativo");
        }
    }

    function sucessoInput(input, idErro) {
        input.classList.remove("erro");
        input.classList.add("sucesso");
        const erro = document.getElementById(idErro);
        if (erro) erro.classList.remove("ativo");
    }

    function validarNome() {
        if (nome.value.trim().length < 6) {
            mostrarErro(nome, "erro-nome", "Mínimo 6 caracteres");
            return false;
        }
        sucessoInput(nome, "erro-nome");
        return true;
    }

    function validarTelefone() {
        const digits = tel.value.replace(/\D/g, "");
        if (digits.length < 10) {
            mostrarErro(tel, "erro-tel", "Telefone inválido");
            return false;
        }
        sucessoInput(tel, "erro-tel");
        return true;
    }

    function validarCep() {
        const valor = cep.value.replace(/\D/g, "");
        if (valor.length !== 8) {
            mostrarErro(cep, "erro-cep", "CEP deve ter 8 dígitos");
            return false;
        }
        sucessoInput(cep, "erro-cep");
        return true;
    }

    function validarNumeroCasa() {
        if (num.value.trim() === "") {
            mostrarErro(num, "erro-num", "Informe o número");
            return false;
        }
        sucessoInput(num, "erro-num");
        return true;
    }

    // Eventos de Input
    nome.addEventListener("input", validarNome);
    tel.addEventListener("input", (e) => {
        let v = e.target.value.replace(/\D/g, "");
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 2) v = "(" + v.slice(0, 2) + ") " + v.slice(2);
        if (v.length > 10) v = v.slice(0, 10) + "-" + v.slice(10);
        e.target.value = v;
        validarTelefone();
    });

    cep.addEventListener("blur", async () => {
        const valor = cep.value.replace(/\D/g, "");
        if (valor.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${valor}/json/`);
                const dataCep = await res.json();
                if (!dataCep.erro) {
                    rua.value = dataCep.logradouro;
                    cidade.value = dataCep.localidade;
                    estado.value = dataCep.uf;
                    sucessoInput(cep, "erro-cep");
                } else {
                    mostrarErro(cep, "erro-cep", "CEP não encontrado");
                }
            } catch {
                mostrarErro(cep, "erro-cep", "Erro ao buscar CEP");
            }
        }
    });

    const modalSenha = document.getElementById("popUp-trocar-senha");
    const btnAbrirSenha = document.querySelector(".btn-alterar-senha");
    const btnFecharSenha = document.getElementById("btn-fechar-senha");

    btnAbrirSenha.addEventListener("click", () => {
        modalSenha.showModal();
    });

    btnFecharSenha.addEventListener("click", () => {
        modalSenha.close();
    });

    const senhaAtual = document.getElementById("senha-atual");
    const novaSenha = document.getElementById("nova-senha");
    const confirmarNova = document.getElementById("confirmar-nova-senha");

    function validarNovaSenha() {
        const valor = novaSenha.value;
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

        if (!regex.test(valor)) {
            mostrarErro(novaSenha, "erro-nova-senha", "Senha inválida");
            return false;
        }

        sucessoInput(novaSenha, "erro-nova-senha");

        if (valor !== confirmarNova.value) {
            mostrarErro(confirmarNova, "erro-confirmar-nova", "As senhas não coincidem");
            return false;
        }

        sucessoInput(confirmarNova, "erro-confirmar-nova");
        return true;
    }
    novaSenha.addEventListener("input", () => {
      const valor = novaSenha.value;
      const requisitos = document.getElementById("requisitosNovaSenha");

      requisitos.style.display = valor.length > 0 ? "block" : "none";

      const maiuscula = /[A-Z]/.test(valor);
      const minuscula = /[a-z]/.test(valor);
      const numero = /[0-9]/.test(valor);
      const especial = /[!@#$%^&*]/.test(valor);
      const tamanho = valor.length >= 8;

      function atualizarReq(id, valido) {
        const el = document.getElementById(id);

        if (!el) return;

        if (valido) {
            el.classList.add("ok");
            el.textContent = "✔️ " + el.textContent.replace("❌ ", "").replace("✔️ ", "");
        } else {
            el.classList.remove("ok");
            el.textContent = "❌ " + el.textContent.replace("✔️ ", "").replace("❌ ", "");
        }
    }
      atualizarReq("req-maiuscula", maiuscula);
      atualizarReq("req-minuscula", minuscula);
      atualizarReq("req-numero", numero);
      atualizarReq("req-especial", especial);
      atualizarReq("req-tamanho", tamanho);
  });
  document.getElementById("confirmar-troca-senha").addEventListener("click", async () => {

      if (!senhaAtual.value) {
          mostrarErro(senhaAtual, "erro-senha-atual", "Digite sua senha atual");
          return;
      }

      if (!validarNovaSenha()) return;

      try {
          const resposta = await fetch("https://lixie-production.up.railway.app/trocar-senha", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  email: email.value,
                  senhaAtual: senhaAtual.value,
                  novaSenha: novaSenha.value
              })
          });

          const dados = await resposta.json();

          if (resposta.ok) {
              alert("Senha alterada com sucesso ✅");
              modalSenha.close();
          } else {
              alert(dados.erro || "Erro ao alterar senha");
          }

      } catch (erro) {
          alert("Erro de conexão com o servidor");
      }
  });

  btnFecharSenha.addEventListener("click", () => {
      modalSenha.close();

      senhaAtual.value = "";
      novaSenha.value = "";
      confirmarNova.value = "";

      document.getElementById("requisitosNovaSenha").style.display = "none";
  });

    // =========================
    // 2. SALVAR ALTERAÇÕES (Botão Salvar)
    // =========================
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const valido = validarNome() && validarTelefone() && validarCep() && validarNumeroCasa();

        if (!valido) {
            alert("Preencha os campos corretamente antes de salvar.");
            return;
        }
        const nadaMudou =
          nome.value === dadosOriginais.nome &&
          tel.value === dadosOriginais.telefone &&
          cep.value === dadosOriginais.cep &&
          rua.value === dadosOriginais.rua &&
          cidade.value === dadosOriginais.cidade &&
          estado.value === dadosOriginais.estado &&
          num.value === dadosOriginais.numero &&
          complemento.value === dadosOriginais.complemento &&
          !inputFoto.files[0];

      if (nadaMudou) {
        if (mensagemNada) {
            mensagemNada.classList.add("ativo");

            setTimeout(() => {
                mensagemNada.classList.remove("ativo");
            }, 2000);
        }

        return;
    }

        const formData = new FormData();
        formData.append("email", email.value);
        formData.append("nome", nome.value);
        formData.append("telefone", tel.value);
        formData.append("dataNascimento", data.value); 
        formData.append("cep", cep.value);
        formData.append("rua", rua.value);
        formData.append("cidade", cidade.value);
        formData.append("estado", estado.value);
        formData.append("numero", num.value);
        formData.append("complemento", complemento.value);

        if (inputFoto.files[0]) {
            formData.append("foto", inputFoto.files[0]);
        }

        try {
            const res = await fetch("https://lixie-production.up.railway.app/atualizar-perfil", {
                method: "POST",
                body: formData 
            });

            const resposta = await res.json();

            if (resposta.ok || resposta.sucesso) {
                mensagem.classList.add("ativo");
                setTimeout(() => {
                    window.location.href = "homeLogado.html";
                }, 3000);
            } else {
                alert("Erro ao salvar: " + (resposta.mensagem || "Verifique os dados"));
            }
        } catch (erro) {
            console.error("Erro ao salvar:", erro);
            alert("Erro de conexão com o servidor.");
        }
    });
});

function toggleSenhaNova(icon) {
    const container = icon.closest("dialog"); // pega o popup inteiro

    const nova = container.querySelector("#nova-senha");
    const confirmar = container.querySelector("#confirmar-nova-senha");

    const mostrando = nova.type === "text";

    if (mostrando) {
        nova.type = "password";
        confirmar.type = "password";
    } else {
        nova.type = "text";
        confirmar.type = "text";
    }

    // muda TODOS os ícones desse grupo
    const icons = container.querySelectorAll(".toggle-senha");

    icons.forEach(i => {
        if (mostrando) {
            i.classList.remove("fa-eye-slash");
            i.classList.add("fa-eye");
        } else {
            i.classList.remove("fa-eye");
            i.classList.add("fa-eye-slash");
        }
    });
}

  function toggleSenhaAtual(icon) {
    const input = icon.parentElement.querySelector("input");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}