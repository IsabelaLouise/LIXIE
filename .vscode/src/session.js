// session.js - responsável por controle de sessão e exibição do modal de sessão expirada

// Lê valor do cookie pelo nome
function readCookie(name) {
    const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function showSessionExpiredModal() {
    const modal = document.getElementById('sessionModal');
    if (!modal) return;
    modal.classList.add('active');
}

function ensureSessionModalExists() {
    if (document.getElementById('sessionModal')) return;
    const modal = document.createElement('div');
    modal.id = 'sessionModal';
    modal.className = 'session-modal';
    modal.innerHTML = `
        <div class="session-box">
            <h2>Sessão expirada</h2>
            <p>Você ficou inativo por muito tempo.<br>Faça login novamente para continuar.</p>
            <button id="sessionModalBtn">Voltar ao login</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('sessionModalBtn').addEventListener('click', fecharModal);
}

function fecharModal() {
    const modal = document.getElementById('sessionModal');
    if (modal) modal.classList.remove('active');
    try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
    window.location.href = '/.vscode/src/homeNaoLogado.html';
}

function scheduleSessionTimeout() {
    const expires = readCookie('session_expires');
    if (!expires) return;

    const expiresTs = parseInt(expires, 10);
    if (isNaN(expiresTs)) return;

    const now = Math.floor(Date.now() / 1000);
    const remaining = (expiresTs - now) * 1000;

    if (remaining <= 0) {
        showSessionExpiredModal();
    } else {
        setTimeout(() => { showSessionExpiredModal(); }, remaining + 250);
    }
}

// intercept fetch to show modal on 401
(function(){
    const originalFetch = window.fetch;
    if (!originalFetch) return;
    window.fetch = function(input, init) {
        try {
            let url = input;
            if (input && input.url) url = input.url; // Request object
            // If request targets the backend, ensure credentials are included
            if (typeof url === 'string' && url.includes('lixie-production.up.railway.app')) {
                init = init || {};
                if (!init.credentials) init.credentials = 'include';
            }
        } catch(e) {
            // ignore
        }

        return originalFetch.call(this, input, init).then(res => {
            if (res && res.status === 401) {
                ensureSessionModalExists();
                showSessionExpiredModal();
            }
            return res;
        }).catch(err => { throw err; });
    };
})();

// On load
document.addEventListener('DOMContentLoaded', () => {
    ensureSessionModalExists();
    scheduleSessionTimeout();
});
