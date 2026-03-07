import type { CartItem } from "@/types";

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

export function enviarPedido(items: CartItem[], telefono = TELEFONO_FALLBACK): void {
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
    `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );
}
