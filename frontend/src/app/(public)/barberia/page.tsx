import type { Metadata } from "next";
import { MessageCircle, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { API_URL } from "@/lib/api";
import type { BarberService, BarberMedia } from "@/types";
import PricingCard from "@/components/barberia/PricingCard";
import PortfolioGrid from "@/components/barberia/PortfolioGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Barbería | Laguna's Barber & Shop",
  description:
    "Cortes profesionales, degradados y servicios de barbería en Cali. Reserva por WhatsApp.",
};

async function fetchData() {
  const [servRes, mediaRes] = await Promise.all([
    fetch(`${API_URL}/api/barber/services`, { next: { revalidate: 120 } }),
    fetch(`${API_URL}/api/barber/media`,    { next: { revalidate: 120 } }),
  ]);

  const servicios: BarberService[] = servRes.ok  ? await servRes.json()  : [];
  const media: BarberMedia[]        = mediaRes.ok ? await mediaRes.json() : [];

  return { servicios, media };
}

export default async function BarberíaPage() {
  const { servicios, media } = await fetchData();

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* Encabezado */}
        <div>
          <h1 className="font-display text-5xl md:text-6xl tracking-widest text-white">
            BARBERÍA
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Cortes profesionales con estilo y precisión
          </p>
        </div>

        {/* Precios */}
        <PricingCard servicios={servicios} />

        {/* Portafolio */}
        <PortfolioGrid media={media} />

        {/* CTA WhatsApp */}
        <section className="bg-[#111] rounded-2xl border border-white/10 p-6 md:p-10 text-center space-y-6">
          <h2 className="font-display text-3xl tracking-widest text-white">
            ¿LISTO PARA TU CORTE?
          </h2>
          <p className="text-gray-400 max-w-md mx-auto text-sm">
            Reserva tu turno o consulta disponibilidad directamente por WhatsApp.
          </p>

          <a
            href="https://wa.me/573028326617?text=Hola%2C%20quiero%20reservar%20un%20turno%20en%20Laguna%27s%20Barber%20%26%20Shop"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25d366] text-black font-semibold px-8 py-3 rounded-full hover:bg-[#1eb958] transition-colors uppercase tracking-wider text-sm"
          >
            <MessageCircle size={18} />
            Reservar turno
          </a>

          {/* Info */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-400 pt-2">
            <span className="flex items-center gap-2 justify-center">
              <MapPin size={14} className="text-gray-500" />
              Calle 5 Av 11E-17, Cali
            </span>
            <span className="flex items-center gap-2 justify-center">
              <Clock size={14} className="text-gray-500" />
              Lun – Sáb, 9AM – 8PM
            </span>
          </div>
        </section>

        {/* Redes sociales */}
        <div className="flex justify-center gap-6">
          <a
            href="https://www.tiktok.com/@lagunas353"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#67c2e6] transition-colors group"
          >
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#67c2e6] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
              </svg>
            </div>
            <span className="text-xs">@lagunas353</span>
          </a>
          <a
            href="https://www.instagram.com/lagunas_barberandshop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#e1306c] transition-colors group"
          >
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#e1306c] transition-colors">
              <Instagram size={20} />
            </div>
            <span className="text-xs">@lagunas_barberandshop</span>
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#1877f2] transition-colors group"
          >
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#1877f2] transition-colors">
              <Facebook size={20} />
            </div>
            <span className="text-xs">Facebook</span>
          </a>
        </div>

      </div>
    </div>
  );
}
