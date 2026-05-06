const TEMPO_MAXIMO = 0.1 * 60 * 1000; // 0.1 minutos em milissegundos

function verificarSessao() {
    const logado = localStorage.getItem("logado");
    const ultimoAcesso = localStorage.getItem("ultimoAcesso");

    if (!logado || !ultimoAcesso) {
        redirecionarLogin();
        return;
    }

    const agora = Date.now();
    const tempoParado = agora - ultimoAcesso;

    if (tempoParado > TEMPO_MAXIMO) {
        localStorage.clear();
        mostrarModalSessao();
    }
}

function atualizarAtividade() {
    localStorage.setItem("ultimoAcesso", Date.now());
}

function redirecionarLogin() {
    window.location.href = "homeNaoLogado.html";
}

// eventos de atividade
document.addEventListener("click", atualizarAtividade);
document.addEventListener("keydown", atualizarAtividade);

// roda automaticamente
verificarSessao();

function mostrarModalSessao() {
    const modal = document.getElementById("sessionModal");

    if (modal) {
        modal.classList.add("active");
    }

    localStorage.clear();
}

function fecharModal() {
    window.location.href = "homeNaoLogado.html";
}