/* ==============================================
   MAIN.JS — Scripts de la página principal
   Laguna's Barber & Shop
   ============================================== */

// Navbar: fondo al hacer scroll
document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar.fixed-top');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});
