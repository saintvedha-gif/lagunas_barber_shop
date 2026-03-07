import type { CartItem } from "@/types";

const TELEFONO = "573028326617";

export function enviarPedido(items: CartItem[]): void {
  const lineas = items.map((i) => {
    const variantes = [
      i.talla ? `Talla: ${i.talla}` : "",
      i.color ? `Color: ${i.color}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    const subtotal = (i.precio * i.cantidad).toLocaleString("es-CO");
    return `▪ ${i.nombre}${variantes ? ` | ${variantes}` : ""} × ${i.cantidad} — $${subtotal}`;
  });

  const total = items
    .reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    .toLocaleString("es-CO");

  const mensaje = [
    "🛍️ *Pedido Laguna's Barber & Shop*",
    "",
    ...lineas,
    "",
    `*Total: $${total}*`,
  ].join("\n");

  window.open(
    `https://wa.me/${TELEFONO}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}
