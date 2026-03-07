"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  agregar: (item: CartItem) => void;
  cambiarCantidad: (id: string, variante: string | undefined, delta: number) => void;
  eliminar: (id: string, variante: string | undefined) => void;
  vaciar: () => void;
  total: () => number;
  count: () => number;
}

/** Genera una clave única por producto + variante (talla-color) */
function itemKey(id: string, talla?: string, color?: string): string {
  return `${id}::${talla ?? ""}::${color ?? ""}`;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item) => {
        const key = itemKey(item.id, item.talla, item.color);
        set((state) => {
          const existing = state.items.findIndex(
            (i) => itemKey(i.id, i.talla, i.color) === key
          );
          if (existing !== -1) {
            const updated = [...state.items];
            updated[existing] = {
              ...updated[existing],
              cantidad: updated[existing].cantidad + item.cantidad,
            };
            return { items: updated };
          }
          return { items: [...state.items, item] };
        });
      },

      cambiarCantidad: (id, variante, delta) => {
        set((state) => {
          const updated = state.items
            .map((i) => {
              const match =
                i.id === id &&
                [i.talla, i.color].filter(Boolean).join("-") === (variante ?? "");
              if (!match) return i;
              return { ...i, cantidad: i.cantidad + delta };
            })
            .filter((i) => i.cantidad > 0);
          return { items: updated };
        });
      },

      eliminar: (id, variante) => {
        set((state) => ({
          items: state.items.filter((i) => {
            const v = [i.talla, i.color].filter(Boolean).join("-");
            return !(i.id === id && v === (variante ?? ""));
          }),
        }));
      },

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),

      count: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: "lagunas-cart",
    }
  )
);
