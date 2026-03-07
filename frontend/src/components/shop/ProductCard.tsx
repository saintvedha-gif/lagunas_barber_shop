"use client";

import Image from "next/image";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { imgUrl } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types";

interface Props {
  producto: Product;
  /** Modo básico (cosméticos) vs extendido (ropa con tallas/colores/zoom) */
  modo?: "cosmetico" | "ropa";
}

export default function ProductCard({ producto, modo = "cosmetico" }: Props) {
  const agregar = useCart((s) => s.agregar);

  const portada =
    producto.imagenes.find((i) => i.esPortada) ?? producto.imagenes[0];
  const urlImg = portada ? imgUrl(portada.nombreArchivo) : null;

  function handleAgregar() {
    agregar({
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: portada?.nombreArchivo ?? "",
      cantidad: 1,
    });
  }

  return (
    <article className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:border-white/30 hover:shadow-lg hover:shadow-black/40 group">
      {/* Imagen */}
      <div className="relative w-full aspect-square bg-[#111] overflow-hidden">
        {urlImg ? (
          <Image
            src={urlImg}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            Sin imagen
          </div>
        )}

        {/* Badge OFERTA */}
        {producto.enOferta && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Oferta
          </span>
        )}

        {/* Badge ÚLTIMAS UNIDADES */}
        {producto.stock > 0 && producto.stock <= 3 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/90 text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
            <AlertTriangle size={10} />
            Últimas unidades
          </span>
        )}

        {/* Badge SIN STOCK */}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-xs font-semibold uppercase tracking-widest">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-medium text-white leading-tight line-clamp-2">
          {producto.nombre}
        </h3>

        {/* Precio */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-[#0dcaf0] font-bold text-base">
            ${producto.precio.toLocaleString("es-CO")}
          </span>
          {producto.enOferta && producto.precioAnterior && (
            <span className="text-gray-500 text-xs line-through">
              ${producto.precioAnterior.toLocaleString("es-CO")}
            </span>
          )}
        </div>

        {/* Botón */}
        <button
          onClick={handleAgregar}
          disabled={producto.stock === 0}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-white text-black text-xs font-semibold uppercase tracking-wider py-2 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={14} />
          {producto.stock === 0 ? "Agotado" : "Añadir"}
        </button>
      </div>
    </article>
  );
}
