import { Scissors } from "lucide-react";
import type { BarberService } from "@/types";

interface Props {
  servicios: BarberService[];
}

export default function PricingCard({ servicios }: Props) {
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
            <li key={s._id} className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-white">{s.nombre}</p>
                {s.descripcion && (
                  <p className="text-sm text-gray-500 mt-0.5">{s.descripcion}</p>
                )}
              </div>
              <span className="ml-4 text-[#0dcaf0] font-bold text-lg shrink-0">
                ${s.precio.toLocaleString("es-CO")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
