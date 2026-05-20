// verificacaoAdmin.js

document.addEventListener("DOMContentLoaded", () => {

    const email = localStorage.getItem("email");
    const permissao = localStorage.getItem("permissao");

    if (!email || permissao !== "admin") {
        mostrarTelaNegada();
    }

});

function mostrarTelaNegada() {

    document.body.innerHTML = `

    <div class="tela-negada">
        <div class="card-negado">
            <h1>Acesso Negado</h1>
            <p>
                Você não possui permissão para acessar esta página.
                <br>
                Volte para a tela de login.
            </p>
            <button onclick="window.location.href='login.html'">
                Ir para Login
            </button>
        </div>
    </div>
    `;
}