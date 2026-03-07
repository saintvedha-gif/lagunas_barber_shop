/* ==============================================
   SHOP-FILTERS.JS — Filtros y buscador del shop
   Compartido por ropa.php y cosmeticos.php
   ============================================== */

// ── Filtrar por categoría (sidebar) ────────────
function filtrarCategoria(categoria, boton) {
    document.querySelectorAll('#sidebar-categorias .list-group-item')
        .forEach(b => b.classList.remove('active'));
    boton.classList.add('active');

    document.querySelectorAll('.producto-item').forEach(p => {
        const mostrar = (categoria === 'todas' || p.dataset.categoria === categoria);
        p.style.display = mostrar ? '' : 'none';
    });
}

// ── Buscador en tiempo real ─────────────────────
document.addEventListener('DOMContentLoaded', function () {

    // ropa.php usa #buscador con data-nombre
    const buscadorRopa = document.getElementById('buscador');
    if (buscadorRopa) {
        buscadorRopa.addEventListener('keyup', function () {
            const q = this.value.toLowerCase();
            document.querySelectorAll('.producto-item').forEach(p => {
                p.style.display = p.dataset.nombre.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    // cosmeticos.php usa #inputBusqueda con .nombre-producto
    const buscadorCos = document.getElementById('inputBusqueda');
    if (buscadorCos) {
        buscadorCos.addEventListener('keyup', function () {
            const q = this.value.toLowerCase();
            document.querySelectorAll('.producto-card-wrapper').forEach(prod => {
                const nombre = prod.querySelector('.nombre-producto')?.innerText.toLowerCase() || '';
                prod.style.display = nombre.includes(q) ? 'block' : 'none';
            });
        });
    }
});
