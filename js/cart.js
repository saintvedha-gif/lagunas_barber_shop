// ===============================
// CARRITO GLOBAL
// ===============================
let carrito = [];


// ===============================
// AGREGAR PRODUCTO
// ===============================
function agregarAlCarrito(nombre, precio, imagen, variante = "") {

    const nombreCompleto = variante ? `${nombre} - ${variante}` : nombre;

    const productoExistente = carrito.find(item => item.nombre === nombreCompleto);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            nombre: nombreCompleto,
            precio: precio,
            imagen: imagen,
            cantidad: 1
        });
    }

    actualizarInterfaz();
}


// ===============================
// CAMBIAR CANTIDAD
// ===============================
function cambiarCantidad(index, cambio) {

    carrito[index].cantidad += cambio;

    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }

    actualizarInterfaz();
}


// ===============================
// ELIMINAR PRODUCTO
// ===============================
function eliminarProducto(index) {
    carrito.splice(index, 1);
    actualizarInterfaz();
}


// ===============================
// ACTUALIZAR MODAL + CONTADOR
// ===============================
function actualizarInterfaz() {

    const lista = document.getElementById('lista-carrito');
    const totalTxt = document.getElementById('total-precio');
    const count = document.getElementById('cart-count');

    if (!lista) return;

    lista.innerHTML = '';

    let total = 0;
    let cantidadTotalItems = 0;

    carrito.forEach((item, index) => {

        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        cantidadTotalItems += item.cantidad;

        lista.innerHTML += `
        <li class="list-group-item border-0 border-bottom py-3">

            <div class="d-flex align-items-center">

                <!-- IMAGEN -->
                <img src="${item.imagen}" 
                     width="60" 
                     height="60"
                     class="rounded me-3"
                     style="object-fit:cover;">

                <!-- INFO -->
                <div class="flex-grow-1">
                    <h6 class="fw-bold mb-1 text-dark">${item.nombre}</h6>
                    <small class="text-muted">
                        COP ${item.precio.toLocaleString('es-CO')}
                    </small>

                    <div class="d-flex align-items-center gap-2 mt-2">

                        <button class="btn btn-sm btn-outline-dark px-2"
                            onclick="cambiarCantidad(${index}, -1)">−</button>

                        <span class="fw-bold text-dark">
                            ${item.cantidad}
                        </span>

                        <button class="btn btn-sm btn-outline-dark px-2"
                            onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                </div>

                <!-- SUBTOTAL -->
                <div class="text-end ms-3">
                    <div class="fw-bold text-dark">
                        COP ${subtotal.toLocaleString('es-CO')}
                    </div>

                    <button class="btn btn-link btn-sm text-danger p-0"
                        onclick="eliminarProducto(${index})">
                        Eliminar
                    </button>
                </div>

            </div>
        </li>
        `;
    });

    if (totalTxt) {
        totalTxt.innerText = `COP ${total.toLocaleString('es-CO')}`;
    }

    if (count) {
        count.innerText = cantidadTotalItems;
    }
}


// ===============================
// ENVIAR PEDIDO A WHATSAPP
// ===============================
function enviarPedido() {

    if (carrito.length === 0) {
        alert("Tu carrito está vacío bro 🔥");
        return;
    }

    const fuego = "🔥";
    const check = "✅";
    const bolsa = "💰";
    const foto = "📸";
    const linea = "━━━━━━━━━━━━━━━━━━";

    let mensaje = `${fuego} *NUEVO PEDIDO - LAGUNA'S BARBER* ${fuego}\n\n`;
    mensaje += "Hola! Me gustaría comprar:\n\n";
    mensaje += `${linea}\n`;

    let totalFinal = 0;

    carrito.forEach(item => {

        const subtotal = item.precio * item.cantidad;
        totalFinal += subtotal;

        mensaje += `${check} *${item.cantidad}x* ${item.nombre}\n`;
        mensaje += `   Subtotal: COP ${subtotal.toLocaleString('es-CO')}\n`;
        mensaje += `   ${foto} ${item.imagen}\n\n`;
    });

    mensaje += `${linea}\n`;
    mensaje += `${bolsa} *TOTAL A PAGAR: COP ${totalFinal.toLocaleString('es-CO')}*\n\n`;
    mensaje += "Quedo atento a confirmación 💈";

    const numeroTelefono = "+573028326617";
    const mensajeCodificado = encodeURIComponent(mensaje);

    window.open(`https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`, '_blank');
}