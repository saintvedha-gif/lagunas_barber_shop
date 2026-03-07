import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Laguna's Barber & Shop | Inicio",
  description:
    "Barbería profesional, ropa urbana y cosméticos capilares en Cali. Laguna's Barber & Shop.",
};

export default function HomePage() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/img/fondo_barber.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Marca de agua — logo centrado detrás del texto */}
      <div className="absolute inset-0 flex items-center justify-center z-1 pointer-events-none select-none">
        <div className="relative w-70 h-70 sm:w-95 sm:h-95 md:w-120 md:h-120 lg:w-140 lg:h-140 opacity-[0.13] sm:opacity-[0.16]">
          <Image
            src="/img/logo-artguru.png"
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 640px) 280px, (max-width: 768px) 380px, (max-width: 1024px) 480px, 560px"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-white tracking-[0.15em] mb-4 drop-shadow-lg">
          LAGUNA&apos;S
        </h1>
        <p className="font-display text-2xl md:text-3xl text-gray-300 tracking-[0.3em] mb-12">
          BARBER &amp; SHOP
        </p>

        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/ropa"
            className="btn-pill bg-white text-black hover:bg-gray-200 font-semibold min-w-45 text-center"
          >
            Ver Ropa
          </Link>
          <Link
            href="/barberia"
            className="btn-pill bg-transparent text-white border border-white hover:bg-white hover:text-black font-semibold min-w-45 text-center"
          >
            Barbería
          </Link>
          <Link
            href="/cosmeticos"
            className="btn-pill bg-transparent text-white border border-white hover:bg-white hover:text-black font-semibold min-w-45 text-center"
          >
            Cosméticos Capilares
          </Link>
        </div>
      </div>
    </section>
  );
}
