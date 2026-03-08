"use client";

import Image from "next/image";
import { Scissors, MessageCircle } from "lucide-react";
import { imgUrl } from "@/lib/api";
import { reservarServicio, fetchTelefono } from "@/lib/whatsapp";
import type { BarberService } from "@/types";

interface Props {
  servicios: BarberService[];
}

export default function PricingCard({ servicios }: Props) {
  async function handleReservar(srv: BarberService) {
    const telefono = await fetchTelefono();
    reservarServicio(srv, telefono);
  }

  return (
    <section className="bg-[#111] rounded-2xl border border-white/10 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Scissors size={22} className="text-white" />
        <h2 className="font-display text-2xl tracking-widest text-white">
          LISTA DE PRECIOS
        </h2>
      </div>

      {servicios.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay servicios disponibles.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {servicios.map((s) => (
            <li key={s._id} className="flex items-center gap-4 py-4">
              {s.imagen && (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#0a0a0a]">
                  <Image
                    src={imgUrl(s.imagen)}
                    alt={s.nombre}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{s.nombre}</p>
                {s.descripcion && (
                  <p className="text-sm text-gray-500 mt-0.5">{s.descripcion}</p>
                )}
              </div>
              <span className="text-[#0dcaf0] font-bold text-lg shrink-0">
                ${s.precio.toLocaleString("es-CO")}
              </span>
              <button
                onClick={() => handleReservar(s)}
                className="shrink-0 flex items-center gap-1.5 bg-[#25d366] text-black text-xs font-semibold px-3 py-2 rounded-full hover:bg-[#1eb958] transition-colors"
              >
                <MessageCircle size={14} />
                Reservar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
