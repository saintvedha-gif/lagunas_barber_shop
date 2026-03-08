import type { CartItem, BarberService } from "@/types";

const TELEFONO_FALLBACK = "573028326617";

/** Obtiene el número de WhatsApp desde la API (con fallback al valor original) */
export async function fetchTelefono(): Promise<string> {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return TELEFONO_FALLBACK;
    const data: Record<string, string> = await res.json();
    return data["whatsapp_numero"]?.trim() || TELEFONO_FALLBACK;
  } catch {
    return TELEFONO_FALLBACK;
  }
}

/** Abre WhatsApp con mensaje de pedido de productos del carrito */
export function enviarPedido(items: CartItem[], telefono = TELEFONO_FALLBACK): void {
  const lineas = items.map((i) => {
    const variantes: string[] = [];
    if (i.talla) variantes.push(`Talla: ${i.talla}`);
    if (i.color) variantes.push(`Color: ${i.color}`);
    const detalle = variantes.length ? ` _(${variantes.join(", ")})_` : "";

    const subtotal = (i.precio * i.cantidad).toLocaleString("es-CO");
    return `🛒 *${i.nombre}*${detalle}\n   × ${i.cantidad} — *$${subtotal}*`;
  });

  const total = items
    .reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    .toLocaleString("es-CO");

  const mensaje = [
    "🛍️ *¡Hola Laguna's Barber & Shop!*",
    "",
    "Estoy interesado en los siguientes productos:",
    "",
    ...lineas,
    "",
    `💰 *Total: $${total}*`,
    "",
    "¿Están disponibles? 🙏",
  ].join("\n");

  window.open(
    `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}

/** Abre WhatsApp con mensaje de reserva de un servicio de barbería */
export function reservarServicio(servicio: BarberService, telefono = TELEFONO_FALLBACK): void {
  const precio = servicio.precio.toLocaleString("es-CO");

  const mensaje = [
    "💈 *¡Hola Laguna's Barber & Shop!*",
    "",
    `Quiero reservar el servicio:`,
    "",
    `✂️ *${servicio.nombre}* — *$${precio}*`,
    servicio.descripcion ? `📝 ${servicio.descripcion}` : "",
    "",
    "¿Tienen disponibilidad? 📅",
  ].filter(Boolean).join("\n");

  window.open(
    `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}
