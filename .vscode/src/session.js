const TEMPO_MAXIMO = 30 * 60 * 1000; // 30 minutos em milissegundos
setInterval(verificarSessao, 10000); // verifica a cada 10s

function verificarSessao() {
    const logado = localStorage.getItem("logado");
    const ultimoAcesso = localStorage.getItem("ultimoAcesso");

    // Se não estiver logado → NÃO mostra modal
    if (logado !== "true") {
        return;
    }

    // Se não tem timestamp → cria um (primeiro acesso)
    if (!ultimoAcesso) {
        localStorage.setItem("ultimoAcesso", Date.now());
        return;
    }

    const agora = Date.now();
    const tempoParado = agora - ultimoAcesso;

    if (tempoParado > TEMPO_MAXIMO) {
        mostrarModalSessao();
    }
}

function tratarInteracao() {
    const logado = localStorage.getItem("logado");

    if (logado !== "true") return;

    const ultimoAcesso = localStorage.getItem("ultimoAcesso");

    if (!ultimoAcesso) {
        localStorage.setItem("ultimoAcesso", Date.now());
        return;
    }

    const agora = Date.now();
    const tempoParado = agora - ultimoAcesso;

    // verifica ANTES de atualizar
    if (tempoParado > TEMPO_MAXIMO) {
        mostrarModalSessao();
        return;
    }

    // só atualiza se ainda está válido
    localStorage.setItem("ultimoAcesso", Date.now());
}

function redirecionarLogin() {
    window.location.href = "/.vscode/src/login.html";
}

// Eventos que representam interação do usuário — atualizam o último acesso
document.addEventListener("click", tratarInteracao);
document.addEventListener("keydown", tratarInteracao);
document.addEventListener("mousemove", tratarInteracao);
document.addEventListener("touchstart", tratarInteracao);
document.addEventListener("scroll", tratarInteracao);

// Quando a aba volta a ficar visível, tratamos como interação
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'visible') tratarInteracao();
});

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
    window.location.href = "/.vscode/src/login.html";
}