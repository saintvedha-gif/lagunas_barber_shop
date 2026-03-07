"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { imgUrl } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import type { Product, ProductImage } from "@/types";

interface Props {
  producto: Product;
}

export default function RopaCard({ producto }: Props) {
  const agregar = useCart((s) => s.agregar);

  // Agrupar imágenes por color
  const coloresDisponibles = Array.from(
    new Set(producto.imagenes.map((i) => i.color).filter(Boolean) as string[])
  );

  const portada =
    producto.imagenes.find((i) => i.esPortada) ?? producto.imagenes[0];

  const [imgActiva, setImgActiva] = useState<ProductImage | undefined>(portada);
  const [colorSeleccionado, setColorSeleccionado] = useState<string>(
    coloresDisponibles[0] ?? ""
  );
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>(
    producto.tallas[0] ?? ""
  );

  // Zoom
  const zoomRef = useRef<HTMLDivElement>(null);

  const handleZoom = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = zoomRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const img = el.querySelector("img") as HTMLImageElement | null;
    if (img) {
      img.style.transformOrigin = `${x}% ${y}%`;
      img.style.transform = "scale(1.8)";
    }
  }, []);

  const handleZoomReset = useCallback(() => {
    const el = zoomRef.current;
    if (!el) return;
    const img = el.querySelector("img") as HTMLImageElement | null;
    if (img) {
      img.style.transform = "scale(1)";
      img.style.transformOrigin = "center center";
    }
  }, []);

  // Miniaturas del color seleccionado
  const miniaturas = colorSeleccionado
    ? producto.imagenes.filter((i) => i.color === colorSeleccionado)
    : producto.imagenes;

  function seleccionarColor(color: string) {
    setColorSeleccionado(color);
    const primera = producto.imagenes.find((i) => i.color === color);
    if (primera) setImgActiva(primera);
  }

  function handleAgregar() {
    if (!tallaSeleccionada && producto.tallas.length > 0) return;
    agregar({
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: imgActiva?.nombreArchivo ?? portada?.nombreArchivo ?? "",
      cantidad: 1,
      talla: tallaSeleccionada || undefined,
      color: colorSeleccionado || undefined,
    });
  }

  const urlImgActiva = imgActiva ? imgUrl(imgActiva.nombreArchivo) : null;

  return (
    <article className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:border-white/30 hover:shadow-lg hover:shadow-black/40">
      {/* Imagen con zoom */}
      <div
        ref={zoomRef}
        className="relative w-full aspect-square bg-[#111] overflow-hidden cursor-zoom-in"
        onMouseMove={handleZoom}
        onMouseLeave={handleZoomReset}
      >
        {urlImgActiva ? (
          <Image
            src={urlImgActiva}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-100"
            draggable={false}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            Sin imagen
          </div>
        )}

        {/* Badge OFERTA */}
        {producto.enOferta && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full z-10">
            Oferta
          </span>
        )}
        {producto.stock > 0 && producto.stock <= 3 && (
          <span className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/90 text-black text-[10px] font-bold uppercase px-2 py-0.5 rounded-full z-10">
            <AlertTriangle size={10} />
            Últimas
          </span>
        )}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="text-white text-xs font-semibold uppercase tracking-widest">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {miniaturas.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-2 overflow-x-auto scrollbar-hide">
          {miniaturas.map((img) => (
            <button
              key={img._id}
              onClick={() => setImgActiva(img)}
              className={[
                "relative w-10 h-10 shrink-0 rounded overflow-hidden border transition-colors",
                imgActiva?._id === img._id
                  ? "border-white"
                  : "border-white/10 hover:border-white/40",
              ].join(" ")}
              aria-label={`Ver imagen ${img.color ?? ""}`}
            >
              <Image
                src={imgUrl(img.nombreArchivo)}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <h3 className="text-sm font-medium text-white leading-tight line-clamp-2">
          {producto.nombre}
        </h3>

        {/* Precio */}
        <div className="flex items-baseline gap-2">
          <span className="text-[#0dcaf0] font-bold text-base">
            ${producto.precio.toLocaleString("es-CO")}
          </span>
          {producto.enOferta && producto.precioAnterior && (
            <span className="text-gray-500 text-xs line-through">
              ${producto.precioAnterior.toLocaleString("es-CO")}
            </span>
          )}
        </div>

        {/* Bolitas de color */}
        {coloresDisponibles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {coloresDisponibles.map((color) => (
              <button
                key={color}
                title={color}
                onClick={() => seleccionarColor(color)}
                className={[
                  "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                  colorSeleccionado === color
                    ? "border-white scale-110"
                    : "border-white/20",
                ].join(" ")}
                style={{ backgroundColor: color.toLowerCase() }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        )}

        {/* Tags de tallas */}
        {producto.tallas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {producto.tallas.map((t) => (
              <button
                key={t}
                onClick={() => setTallaSeleccionada(tallaSeleccionada === t ? "" : t)}
                disabled={producto.stock === 0}
                aria-pressed={tallaSeleccionada === t}
                className={[
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all duration-150 leading-none",
                  tallaSeleccionada === t
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-gray-400 border-white/20 hover:border-white/50 hover:text-white",
                  producto.stock === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Botón añadir */}
        <button
          onClick={handleAgregar}
          disabled={
            producto.stock === 0 ||
            (producto.tallas.length > 0 && !tallaSeleccionada)
          }
          className="mt-auto w-full flex items-center justify-center gap-2 bg-white text-black text-xs font-semibold uppercase tracking-wider py-2 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={14} />
          {producto.stock === 0
            ? "Agotado"
            : producto.tallas.length > 0 && !tallaSeleccionada
            ? "Selecciona talla"
            : "Añadir"}
        </button>
      </div>
    </article>
  );
}
