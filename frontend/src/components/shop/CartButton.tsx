"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import CartDrawer from "./CartDrawer";

export default function CartButton() {
  const [abierto, setAbierto] = useState(false);
  const count = useCart((s) => s.count());

  if (count === 0 && !abierto) return null;

  return (
    <>
      {/* Botón flotante — solo visible con items en el carrito */}
      <button
        onClick={() => setAbierto(true)}
        aria-label="Abrir carrito"
        className="cart-floating"
      >
        <ShoppingCart size={22} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#0dcaf0] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      <CartDrawer abierto={abierto} onCerrar={() => setAbierto(false)} />
    </>
  );
}
