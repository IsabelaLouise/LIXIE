// verificacao.js

document.addEventListener("DOMContentLoaded", () => {

    const email = localStorage.getItem("email");

    if (!email) {
        window.location.href = "cadastrese.html";
    }

});