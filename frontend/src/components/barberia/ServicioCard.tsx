"use client";

import Image from "next/image";
import { MessageCircle, Scissors } from "lucide-react";
import { imgUrl } from "@/lib/api";
import { reservarServicio, fetchTelefono } from "@/lib/whatsapp";
import type { BarberService } from "@/types";

interface Props {
  servicio: BarberService;
}

export default function ServicioCard({ servicio }: Props) {
  const urlImg = servicio.imagen ? imgUrl(servicio.imagen) : null;

  async function handleReservar() {
    const telefono = await fetchTelefono();
    reservarServicio(servicio, telefono);
  }

  return (
    <article className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:border-white/30 hover:shadow-lg hover:shadow-black/40 group">
      {/* Imagen o placeholder */}
      <div className="relative w-full aspect-square bg-[#111] overflow-hidden">
        {urlImg ? (
          <Image
            src={urlImg}
            alt={servicio.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-700">
            <Scissors size={32} strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-medium text-white leading-tight line-clamp-2">
          {servicio.nombre}
        </h3>

        {servicio.descripcion && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {servicio.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-[#0dcaf0] font-bold text-base">
            ${servicio.precio.toLocaleString("es-CO")}
          </span>
        </div>

        <button
          onClick={handleReservar}
          className="mt-1 w-full flex items-center justify-center gap-2 bg-[#25d366] text-black text-xs font-semibold uppercase tracking-wider py-2 rounded-lg hover:bg-[#1eb958] transition-colors"
        >
          <MessageCircle size={14} />
          Reservar
        </button>
      </div>
    </article>
  );
}
