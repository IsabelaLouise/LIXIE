// home.js (Público)
console.log("Bem-vinda à Home Pública!");

// MENU MOBILE TOGGLE
const menuToggle = document.getElementById('menuToggle');
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle menu ao clicar no botão
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navbar.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Fechar menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuToggle.classList.remove('active');
    });
});

// Fechar menu ao redimensionar para desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        navbar.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});

// Se você quiser mostrar o Ranking Global vindo do banco, 
// você pode fazer um fetch aqui, mas sem precisar de e-mail.