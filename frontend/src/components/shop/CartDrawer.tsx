"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { enviarPedido, fetchTelefono } from "@/lib/whatsapp";
import { imgUrl } from "@/lib/api";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

export default function CartDrawer({ abierto, onCerrar }: Props) {
  const items = useCart((s) => s.items);
  const cambiarCantidad = useCart((s) => s.cambiarCantidad);
  const eliminar = useCart((s) => s.eliminar);
  const vaciar = useCart((s) => s.vaciar);
  const total = useCart((s) => s.total());

  // Cerrar con Escape
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    if (abierto) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [abierto, onCerrar]);

  // Evitar scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [abierto]);

  function getVariante(item: (typeof items)[0]): string | undefined {
    const partes = [item.talla, item.color].filter(Boolean);
    return partes.length ? partes.join("-") : undefined;
  }

  async function handleEnviar() {
    if (items.length === 0) return;
    const telefono = await fetchTelefono();
    enviarPedido(items, telefono);
  }

  return (
    <>
      {/* Backdrop */}
      {abierto && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={onCerrar}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={[
          "fixed top-0 right-0 h-full w-full max-w-sm bg-[#111] z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl",
          abierto ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-display text-xl tracking-widest text-white">
            CARRITO
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Lista de ítems */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 mt-16 text-sm">
              Tu carrito está vacío
            </p>
          ) : (
            items.map((item, i) => (
              <div
                key={i}
                className="flex gap-3 bg-[#1a1a1a] rounded-lg p-3 border border-white/5"
              >
                {/* Imagen */}
                <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-[#222]">
                  {item.imagen ? (
                    <Image
                      src={imgUrl(item.imagen)}
                      alt={item.nombre}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#222]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.nombre}
                  </p>
                  {(item.talla || item.color) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[item.talla, item.color].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-[#0dcaf0] text-sm font-semibold mt-1">
                    ${(item.precio * item.cantidad).toLocaleString("es-CO")}
                  </p>

                  {/* Controles cantidad */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => cambiarCantidad(item.id, getVariante(item), -1)}
                      className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors"
                      aria-label="Reducir"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-sm text-white w-4 text-center">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => cambiarCantidad(item.id, getVariante(item), 1)}
                      className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors"
                      aria-label="Aumentar"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => eliminar(item.id, getVariante(item))}
                      className="ml-auto text-red-500 hover:text-red-400 transition-colors"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="text-[#198754] font-bold text-lg">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
            <button
              onClick={handleEnviar}
              className="w-full flex items-center justify-center gap-2 bg-[#25d366] text-black font-semibold py-3 rounded-xl hover:bg-[#1eb958] transition-colors uppercase tracking-wider text-sm"
            >
              <MessageCircle size={18} />
              Enviar pedido por WhatsApp
            </button>
            <button
              onClick={vaciar}
              className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
