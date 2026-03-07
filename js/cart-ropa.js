/* ==============================================
   CART-ROPA.JS — Laguna's Shop
   ============================================== */

let carrito = [];

/* ════════════════════════════════════════════
   ZOOM
   ════════════════════════════════════════════ */
function zoomMover(e) {
    const img = e.currentTarget.querySelector('.zoom-img');
    if (!img) return;
    const r = e.currentTarget.getBoundingClientRect();
    img.style.transformOrigin =
        `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
}
function zoomReset(e) {
    const img = e.currentTarget.querySelector('.zoom-img');
    if (img) img.style.transformOrigin = 'center center';
}

/* ════════════════════════════════════════════
   MAPA DE IMÁGENES POR COLOR
   Se construye leyendo el DOM al iniciar.
   Clave: colorNormalizado → [src1, src2, ...]
   ════════════════════════════════════════════ */
const mapaColorImgs = {};   // { "prod-1": { "negro": ["img/a.jpg","img/b.jpg"], ... } }

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.product-card').forEach(tarjeta => {
        const mainImg = tarjeta.querySelector('.zoom-img');
        if (!mainImg) return;
        const pid = mainImg.id; // ej: "main-img-1"

        mapaColorImgs[pid] = {};

        tarjeta.querySelectorAll('.thumb-mini').forEach(thumb => {
            const color = (thumb.dataset.color || '').toLowerCase().trim();
            // src relativo: quitamos el origen del browser
            const src = thumb.getAttribute('src'); // siempre relativo desde PHP
            if (!mapaColorImgs[pid][color]) mapaColorImgs[pid][color] = [];
            mapaColorImgs[pid][color].push(src);
        });
    });
});

/* ════════════════════════════════════════════
   CAMBIAR IMAGEN DESDE MINIATURA (clic directo)
   ════════════════════════════════════════════ */
function cambiarImagen(idProducto, rutaRelativa, thumbClickeado) {
    const tarjeta = thumbClickeado.closest('.product-card');
    const mainImg = tarjeta.querySelector('.zoom-img');
    if (mainImg) mainImg.setAttribute('src', rutaRelativa);

    tarjeta.querySelectorAll('.thumb-mini').forEach(t => t.classList.remove('active'));
    thumbClickeado.classList.add('active');

    // Sincronizar bolita activa si la miniatura tiene color
    const colorThumb = (thumbClickeado.dataset.color || '').toLowerCase().trim();
    if (colorThumb) {
        sincronizarBolita(tarjeta, colorThumb);
    }
}

/* ════════════════════════════════════════════
   SELECCIONAR COLOR (bolita)
   ════════════════════════════════════════════ */
function seleccionarColorSwatch(elemento, nombreColor, idInputOculto, _ignorado, idContador) {
    const colorN = nombreColor.toLowerCase().trim();
    const tarjeta = elemento.closest('.product-card');

    // 1 · Bolita activa
    tarjeta.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
    elemento.classList.add('active');

    // 2 · Input oculto y label
    const input = document.getElementById(idInputOculto);
    if (input) input.value = colorN;
    const label = document.getElementById('color-label-' + idContador);
    if (label) label.textContent = colorN.toUpperCase();

    // 3 · Mostrar/ocultar miniaturas
    const thumbs = tarjeta.querySelectorAll('.thumb-mini');
    let primera = null;
    thumbs.forEach(thumb => {
        const ct = (thumb.dataset.color || '').toLowerCase().trim();
        // visible si: sin color asignado  OR  coincide con el elegido
        const visible = (ct === '' || ct === colorN);
        thumb.style.display = visible ? '' : 'none';
        thumb.classList.remove('active');
        if (visible && !primera) primera = thumb;
    });

    // 4 · Cambiar imagen principal
    const mainImg = tarjeta.querySelector('.zoom-img');
    if (!mainImg) return;

    if (primera) {
        // Usa getAttribute para obtener la ruta RELATIVA (no la absoluta del browser)
        const src = primera.getAttribute('src');
        mainImg.setAttribute('src', src);
        primera.classList.add('active');
    } else {
        // Fallback: buscar en el mapa construido al cargar
        const pid = mainImg.id;
        const imgs = mapaColorImgs[pid]?.[colorN];
        if (imgs && imgs.length > 0) {
            mainImg.setAttribute('src', imgs[0]);
        }
    }
}

/* helper: sincroniza la bolita de color con la miniatura activa */
function sincronizarBolita(tarjeta, color) {
    tarjeta.querySelectorAll('.color-circle').forEach(c => {
        const cc = (c.dataset.color || '').toLowerCase().trim();
        c.classList.toggle('active', cc === color);
    });
    const label = tarjeta.querySelector('[id^="color-label-"]');
    if (label) label.textContent = color.toUpperCase();
    const input = tarjeta.querySelector('[id^="color-input-"]');
    if (input) input.value = color;
}

/* ════════════════════════════════════════════
   CARRITO
   ════════════════════════════════════════════ */
function agregarRopaAlCarrito(nombre, precio, idSelectTalla, idColorInput) {
    const tallaEl = document.getElementById(idSelectTalla);
    const talla   = tallaEl ? tallaEl.value : '';
    const color   = document.getElementById(idColorInput)?.value || '';

    const ref     = tallaEl || document.getElementById(idColorInput);
    const tarjeta = ref?.closest('.product-card');
    const rutaImg = tarjeta?.querySelector('.zoom-img')?.getAttribute('src') || '';

    let partes = [nombre];
    if (color) partes.push('Color: ' + color.toUpperCase());
    if (talla) partes.push('Talla: ' + talla);
    const nombreFinal = partes.join(' | ');

    const existe = carrito.find(p => p.nombre === nombreFinal);
    if (existe) { existe.cantidad++; }
    else { carrito.push({ nombre: nombreFinal, precio, cantidad: 1, imagen: rutaImg }); }

    actualizarInterfaz();

    // Feedback visual en botón
    const btn = tarjeta?.querySelector('.btn-agregar');
    if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>AGREGADO';
        btn.classList.add('agregado');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('agregado'); }, 1300);
    }
}

function eliminarProducto(i)  { carrito.splice(i, 1); actualizarInterfaz(); }
function cambiarCantidad(i,d) {
    carrito[i].cantidad += d;
    if (carrito[i].cantidad <= 0) eliminarProducto(i);
    else actualizarInterfaz();
}

function actualizarInterfaz() {
    const lista    = document.getElementById('lista-carrito');
    const totalTxt = document.getElementById('total-precio');
    const count    = document.getElementById('cart-count');
    if (!lista) return;

    lista.innerHTML = '';
    let total = 0, items = 0;

    carrito.forEach((item, i) => {
        const sub = item.precio * item.cantidad;
        total += sub; items += item.cantidad;
        lista.innerHTML += `
        <li class="list-group-item d-flex align-items-center gap-3 py-3 border-bottom">
            <img src="${item.imagen}" style="width:52px;height:52px;object-fit:cover;flex-shrink:0;">
            <div class="flex-grow-1 text-dark">
                <p class="fw-bold mb-0" style="font-size:0.78rem;text-transform:uppercase;letter-spacing:1px;">${item.nombre}</p>
                <small class="text-secondary">COP ${item.precio.toLocaleString('es-CO')}</small>
                <div class="d-flex align-items-center gap-2 mt-1">
                    <button class="btn btn-sm btn-outline-dark px-2 py-0" onclick="cambiarCantidad(${i},-1)">−</button>
                    <span class="fw-bold">${item.cantidad}</span>
                    <button class="btn btn-sm btn-outline-dark px-2 py-0" onclick="cambiarCantidad(${i},1)">+</button>
                </div>
            </div>
            <div class="text-end text-dark" style="min-width:90px;">
                <span class="fw-bold d-block">COP ${sub.toLocaleString('es-CO')}</span>
                <button class="btn btn-link btn-sm text-danger p-0" onclick="eliminarProducto(${i})">Eliminar</button>
            </div>
        </li>`;
    });

    if (totalTxt) totalTxt.innerText = `COP ${total.toLocaleString('es-CO')}`;
    if (count)    count.innerText    = items;
}

function enviarPedido() {
    if (!carrito.length) { alert('Tu carrito está vacío 🔥'); return; }
    let msg = `🔥 *NUEVO PEDIDO - LAGUNA'S SHOP* 🔥\n\nHola! Me gustaría encargar:\n\n`;
    carrito.forEach(p => {
        msg += `✅ *${p.cantidad}x* ${p.nombre}\n`;
        msg += `💰 Subtotal: COP ${(p.precio * p.cantidad).toLocaleString('es-CO')}\n\n`;
    });
    msg += `*TOTAL: ${document.getElementById('total-precio').innerText}*\n\n📌 ¿Me confirmas disponibilidad?`;
    window.open(`https://api.whatsapp.com/send?phone=573028326617&text=${encodeURIComponent(msg)}`, '_blank');
}
