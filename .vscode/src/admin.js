(function(){
  // MENU MOBILE TOGGLE igual home.js
  document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navbar = document.getElementById('navbar');
    if (menuToggle && navbar) {
      menuToggle.addEventListener('click', function() {
        navbar.classList.toggle('active');
        menuToggle.classList.toggle('active');
      });
      // Fecha menu ao clicar em um link (mobile UX)
      navbar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          navbar.classList.remove('active');
          menuToggle.classList.remove('active');
        });
      });
    }
  });
})();
(function(){
  // Foto do usuário logado no admin
  document.addEventListener('DOMContentLoaded', function() {
    const fotoHome = document.getElementById("fotoHome");
    if (!fotoHome) return;
    const email = localStorage.getItem("email");
    if (!email) return;
    fetch("http://localhost:8000/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `email=${encodeURIComponent(email)}`
    })
    .then(res => res.json())
    .then(usuario => {
      if (usuario.foto && usuario.foto.trim().startsWith("http")) {
        fotoHome.src = usuario.foto.trim();
      } else {
        fotoHome.src = "img/avatar.png";
      }
    })
    .catch(err => console.error("Erro ao carregar foto:", err));
  });
})();
function mostrarPopup(titulo, mensagem) {
  

    const popup = document.getElementById("popup-global");

    const tituloPopup = document.getElementById("popup-global-titulo");

    const textoPopup = document.getElementById("popup-global-texto");

    const botaoPopup = document.getElementById("popup-global-btn");

    tituloPopup.textContent = titulo;

    textoPopup.textContent = mensagem;

    popup.style.display = "flex";

    botaoPopup.onclick = () => {
        popup.style.display = "none";
    };
        // FECHA TODOS OS DIALOGS ABERTOS
    document.querySelectorAll('dialog[open]').forEach(dialog => {
        dialog.close();
    });

    popup.classList.add('overlay-popup');

    popup.innerHTML = `
        <div class="popup-global-box">
            <h3>${titulo}</h3>
            <p>${mensagem}</p>

            <button id="fecharPopupGlobal">
                OK
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    document
        .getElementById('fecharPopupGlobal')
        .addEventListener('click', () => {
            popup.remove();
        });
}
// Simple admin guard and table loader
// Define base API URL: when the page origin is NOT the backend origin, point to backend at localhost:8000
const BACKEND_ORIGIN = 'http://localhost:8000';
const API_BASE = (location.origin === BACKEND_ORIGIN) ? '' : BACKEND_ORIGIN;
console.log('[admin] API_BASE resolved to', API_BASE || '(same origin)');

(function(){
  // Redirect non-admins
  const permissao = (localStorage.getItem('permissao') || 'usuario');
  const userEmail = localStorage.getItem('email');
  console.log('[admin] permissao=', permissao, 'email=', userEmail);
  const IS_ADMIN = (typeof permissao === 'string' && permissao.toLowerCase() === 'admin');

  // Basic table population placeholders
  window.loadUsuarios = async function() {
    try {
      const url = `${API_BASE}/ranking`;
      console.log('[admin] fetch usuarios ->', url);
      let res = await fetch(url, { method: 'POST' });
      // fallback: se o servidor retornar 405 (Method Not Allowed), tenta GET
      if (res.status === 405) {
        console.warn('[admin] /ranking retornou 405, tentando GET como fallback');
        res = await fetch(url, { method: 'GET' });
      }
      let dados;
      try {
        dados = await res.json();
      } catch (e) {
        const txt = await res.text().catch(() => '<no-body>');
        console.error('[admin] resposta do /ranking não é JSON, status=', res.status, 'body=', txt);
        return;
      }
      if (!res.ok) {
        console.error('[admin] /ranking retornou erro', res.status, dados);
        return;
      }
      // expecting an array
      const tbody = document.querySelector('#usuariosTable tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      if (Array.isArray(dados)) {
        dados.sort((a, b) => a.id - b.id);
        dados.forEach(u => {
          const tr = document.createElement('tr');
          if (IS_ADMIN) {
            tr.innerHTML = `
              <td>${u.id || ''}</td>
              <td>${u.nome || ''}</td>
              <td>${u.email || ''}</td>
              <td>${u.pontos || 0}</td>
              <td>${u.permissao || ''}</td>
              <td>
                <button class="btn small" data-email="${u.email}">Editar</button>
                <button class="btn small danger" data-email="${u.email}">Excluir</button>
              </td>
            `;
          } else {
            tr.innerHTML = `
              <td>${u.id || ''}</td>
              <td>${u.nome || ''}</td>
              <td>${u.email || ''}</td>
              <td>${u.pontos || 0}</td>
              <td>${u.permissao || ''}</td>
              <td>—</td>
            `;
          }
          tbody.appendChild(tr);
        });
        // attach handlers (only present for admins)
        if (IS_ADMIN) {
          tbody.querySelectorAll('button.small.danger').forEach(btn => {

            btn.addEventListener('click', async (e) => {

              const email = e.currentTarget.dataset.email;

              const dialogExcluirUsuario =
                document.getElementById('dialog-excluir-usuario');

              const btnConfirmarExcluirUsuario =
                document.getElementById('confirmar-excluir-usuario');

              dialogExcluirUsuario.showModal();

              btnConfirmarExcluirUsuario.onclick = async () => {

                try {

                  const requester = localStorage.getItem('email');

                  const resp = await fetch(`${API_BASE}/deletar-usuario`, {
                    method: 'POST',
                    headers: {
                      'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                      requester,
                      email
                    })
                  });

                  if (resp.ok) {

                    dialogExcluirUsuario.close();

                    const overlay =
                      document.getElementById('admin-mensagem-sucesso');

                    overlay.querySelector('p').textContent =
                      'Usuário deletado com sucesso';

                    overlay.style.display = '';
                    overlay.classList.add('ativo');

                    setTimeout(() => {

                      overlay.classList.remove('ativo');
                      overlay.style.display = 'none';

                    }, 2000);

                    loadUsuarios();

                  } else {

                    mostrarPopup(
                      "Erro",
                      "Ocorreu um erro inesperado."
                    );

                  }

                } catch (err) {

                  console.error(err);

                  mostrarPopup(
                    "Erro",
                    "Ocorreu um erro inesperado."
                  );

                }

              };

            });

          });
        }
      }
    } catch (e) {
      console.error('Erro ao carregar usuarios:', e);
    }
  };

  window.loadReciclagens = async function() {
    try {
      const url = `${API_BASE}/listar-reciclagens`;
      console.log('[admin] fetch reciclagens ->', url);
      let res = await fetch(url, { method: 'POST' });
      if (res.status === 405) {
        console.warn('[admin] /listar-reciclagens retornou 405, tentando GET como fallback');
        res = await fetch(url, { method: 'GET' });
      }
      let dados;
      try {
        dados = await res.json();
      } catch (e) {
        const txt = await res.text().catch(() => '<no-body>');
        console.error('[admin] resposta do /listar-reciclagens não é JSON, status=', res.status, 'body=', txt);
        return;
      }
      if (!res.ok) {
        console.error('[admin] /listar-reciclagens retornou erro', res.status, dados);
        return;
      }
      const tbody = document.querySelector('#reciclagensTable tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      if (Array.isArray(dados)) {
        dados.sort((a, b) => a.id - b.id);
        dados.forEach(r => {
          const tr = document.createElement('tr');
          if (IS_ADMIN) {
            tr.innerHTML = `
              <td>${r.id || ''}</td>
              <td>${r.tipo || ''}</td>
              <td>${r.data || ''}</td>
              <td>${r.quantidade || ''}</td>
              <td>${r.usuario_email || r.usuario_nome || ''}</td>
              <td>${r.pontos || ''}</td>
              <td>
                <button class="btn small" data-id="${r.id}">Editar</button>
                <button class="btn small danger" data-id="${r.id}">Excluir</button>
              </td>
            `;
          } else {
            tr.innerHTML = `
              <td>${r.id || ''}</td>
              <td>${r.tipo || ''}</td>
              <td>${r.data || ''}</td>
              <td>${r.quantidade || ''}</td>
              <td>${r.usuario_email || r.usuario_nome || ''}</td>
              <td>${r.pontos || ''}</td>
              <td>—</td>
            `;
          }
          tbody.appendChild(tr);
        });
        if (IS_ADMIN) {
          tbody.querySelectorAll('button.small.danger').forEach(btn => {
            btn.addEventListener('click', (e) => {
              const id = e.currentTarget.dataset.id;
              const dialogExcluirRec = document.getElementById('dialog-excluir-reciclagem');
              const btnConfirmarExcluirRec = document.getElementById('confirmar-excluir-reciclagem');

              dialogExcluirRec.showModal();

              btnConfirmarExcluirRec.onclick = async () => {
                try {
                  const requester = localStorage.getItem('email');

                  const resp = await fetch(`${API_BASE}/deletar-reciclagem`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ requester, id })
                  });

                  if (resp.ok) {
                    dialogExcluirRec.close();
                    const overlay = document.getElementById('admin-mensagem-sucesso');
                    overlay.querySelector('p').textContent = 'Reciclagem deletada com sucesso';
                    overlay.style.display = '';
                    overlay.classList.add('ativo');

                    setTimeout(() => {
                      overlay.classList.remove('ativo');
                      overlay.style.display = 'none';
                    }, 2000);
                    loadReciclagens();
                  } else {
                    alert('Erro ao deletar reciclagem');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Erro');
                }
              };
            });
          });
        }
      } else {
        console.warn('[admin] /listar-reciclagens retornou sem ser array:', dados);
      }
    } catch (e) {
      console.error('Erro ao carregar reciclagens:', e);
    }
  }

document.addEventListener('DOMContentLoaded', () => {
    loadUsuarios();
    loadReciclagens();
  });
})();

// populate debug bar (if present)
(function(){
  function refreshDebugBar(){
    const dbgEmail = document.getElementById('dbg-email');
    const dbgPerm = document.getElementById('dbg-perm');
    if (dbgEmail) dbgEmail.textContent = localStorage.getItem('email') || '-';
    if (dbgPerm) dbgPerm.textContent = localStorage.getItem('permissao') || '-';
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    refreshDebugBar();
    const btn = document.getElementById('dbg-toggle-admin');
    if (btn) btn.addEventListener('click', ()=>{
      localStorage.setItem('permissao','admin');
      // keep same email if exists
      if (!localStorage.getItem('email')) localStorage.setItem('email','isabelalouise.cs@gmail.com');
      refreshDebugBar();
      // reload tables
      window.loadUsuarios && window.loadUsuarios();
      window.loadReciclagens && window.loadReciclagens();
    });
  });
})();

// --- Edição: comportamentos de modal compartilhados ---
window.loadUsuarios = loadUsuarios;
window.loadReciclagens = loadReciclagens;
(function(){
  // Usuário
  const dialogUsuario = document.getElementById('dialog-editar-usuario');
  const formUsuario = document.getElementById('form-editar-usuario');
  if (dialogUsuario) {
    const fecharExcluirUsuario = document.getElementById('fechar-excluir-usuario');
    const cancelarExcluirUsuario = document.getElementById('cancelar-excluir-usuario');
    const dialogExcluirUsuario = document.getElementById('dialog-excluir-usuario');

    if (fecharExcluirUsuario) {
    fecharExcluirUsuario.addEventListener('click', () => {
        dialogExcluirUsuario.close();
    });
    }

    if (cancelarExcluirUsuario) {
        cancelarExcluirUsuario.addEventListener('click', () => {
            dialogExcluirUsuario.close();
        });
    }
    document.getElementById('fechar-editar-usuario').addEventListener('click', () => dialogUsuario.close());
    document.getElementById('cancelar-editar-usuario').addEventListener('click', () => dialogUsuario.close());

    // abridor: delegação (table pode ser recarregada)
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#usuariosTable button');
      if (!btn) return;
      if (btn.textContent.trim() === 'Editar') {
        const tr = btn.closest('tr');
        const id = tr.children[0].textContent.trim();
        const nome = tr.children[1].textContent.trim();
        const email = tr.children[2].textContent.trim();
        const pontos = tr.children[3].textContent.trim();
        const permissao = tr.children[4].textContent.trim();

        document.getElementById('edit-nome').value = nome;
        document.getElementById('edit-email').value = email;
        document.getElementById('edit-pontos').value = pontos || 0;
        document.getElementById('edit-permissao').value = permissao || 'usuario';

        try { dialogUsuario.showModal(); } catch (e) { dialogUsuario.style.display = 'block'; }
      }
    });

    formUsuario.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const nome = document.getElementById('edit-nome').value;
      const email = document.getElementById('edit-email').value;
      const pontos = Number(document.getElementById('edit-pontos').value) || 0;
      const permissao = document.getElementById('edit-permissao').value;

      try {
        const requester = localStorage.getItem('email');
        // enviar para endpoint existente (editar-usuario) — se não existir, backend precisa criar
        const res = await fetch(`${API_BASE}/editar-usuario`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ requester, email, nome, pontos, permissao }) });
        const j = await res.json().catch(()=>({}));
        if (res.ok) {
          // mostrar overlay de sucesso (reaproveita admin-mensagem-sucesso se existir)
          const overlay = document.getElementById('admin-mensagem-sucesso') || document.getElementById('mensagem-sucesso');
          if (overlay) {
            if (overlay.parentNode !== document.body) document.body.appendChild(overlay);
            overlay.style.display = '';
            overlay.classList.add('ativo');
            setTimeout(() => { overlay.classList.remove('ativo'); overlay.style.display='none'; }, 2000);
          } else mostrarPopup(
            "Erro",
        );

          dialogUsuario.close();
          // recarrega usuários
          await loadUsuarios();
        } else {
          // tenta extrair mensagem do corpo
          let bodyText = '';
          try { bodyText = JSON.stringify(j); } catch(e){ bodyText = String(j); }
          console.error('[admin] /editar-usuario erro', res.status, bodyText);
          mostrarPopup(
            "Erro",
            "Ocorreu um erro inesperado ao salvar, verifique o servidor."
        );
        }
      } catch (err) { console.error(err); mostrarPopup(
        "Erro",
        "Ocorreu um erro inesperado."
    );; }
    });
  }

  // Reciclagem
  const dialogRec = document.getElementById('dialog-editar-reciclagem');
  const formRec = document.getElementById('form-editar-reciclagem');

  
  if (dialogRec) {
    document.getElementById('fechar-editar-reciclagem').addEventListener('click', () => dialogRec.close());
    document.getElementById('cancelar-editar-reciclagem').addEventListener('click', () => dialogRec.close());

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#reciclagensTable button');
      if (!btn) return;
      if (btn.textContent.trim() === 'Editar') {
        const tr = btn.closest('tr');
        const id = tr.children[0].textContent.trim();
        const tipo = tr.children[1].textContent.trim();
        const data = tr.children[2].textContent.trim();
        const quantidade = tr.children[3].textContent.trim();
        const pontos = tr.children[5].textContent.trim();

        document.getElementById('edit-id-rec').value = id;
        document.getElementById('edit-tipo').value = tipo;
        // tenta formatar data para YYYY-MM-DD se necessário
        document.getElementById('edit-data').value = data ? data.split(' ')[0] : '';
        document.getElementById('edit-quantidade').value = quantidade;
        document.getElementById('edit-pontos').value = pontos || 0;

        try { dialogRec.showModal(); } catch (e) { dialogRec.style.display = 'block'; }
      }
    });

    formRec.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const id = document.getElementById('edit-id-rec').value;
      const tipo = document.getElementById('edit-tipo').value;
      const data = document.getElementById('edit-data').value;
      const quantidade = document.getElementById('edit-quantidade').value;
      const pontos = Number(document.getElementById('edit-pontos').value) || 0;


// bloqueia negativos
      if (quantidade < 0 || pontos < 0) {
        alert('Não é permitido inserir valores negativos.');
        return;
}

// bloqueia NaN (campo vazio ou inválido)
      if (isNaN(quantidade) || isNaN(pontos)) {
        alert('Preencha os campos corretamente.');
        return;
}
      try {
        const requester = localStorage.getItem('email');
        const res = await fetch(`${API_BASE}/editar-reciclagem`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ requester, id, tipo, data, quantidade, pontos })
        });
        if (res.ok) {
          const overlay = document.getElementById('admin-mensagem-sucesso') || document.getElementById('mensagem-sucesso');
          if (overlay) {
            if (overlay.parentNode !== document.body) document.body.appendChild(overlay);
            overlay.style.display = '';
            overlay.classList.add('ativo');
            setTimeout(() => { overlay.classList.remove('ativo'); overlay.style.display='none'; }, 2000);
          } else mostrarPopup(
            "Salvo!",
        );;

          dialogRec.close();
          await loadReciclagens();
        } else {
          let txt = await res.text().catch(()=>'');
          console.error('[admin] /editar-reciclagem erro', res.status, txt);
          mostrarPopup(
                "Erro",
                "Ao salvar alterações."
            );
        }
      } catch (err) { console.error(err); mostrarPopup(
        "Erro",
        "Ocorreu um erro inesperado."
    ); }
    });
  }
})();
// FECHAR POPUP EXCLUIR RECICLAGEM
const dialogExcluirRec = document.getElementById('dialog-excluir-reciclagem');

const fecharExcluirRec = document.getElementById('fechar-excluir-reciclagem');

const cancelarExcluirRec = document.getElementById('cancelar-excluir-reciclagem');

if (fecharExcluirRec) {
  fecharExcluirRec.addEventListener('click', () => {
    dialogExcluirRec.close();
  });
}

if (cancelarExcluirRec) {
  cancelarExcluirRec.addEventListener('click', () => {
    dialogExcluirRec.close();
  });
}