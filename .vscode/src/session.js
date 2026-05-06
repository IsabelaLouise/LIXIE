const TEMPO_MAXIMO = 0.2 * 60 * 1000; // 0.2 minutos em milissegundos
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

// eventos de atividade
document.addEventListener("click", tratarInteracao);
document.addEventListener("keydown", tratarInteracao);

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
    window.location.href = "login.html";
}