import type { Metadata } from "next";
import Link from "next/link";

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
            className="btn-pill bg-white text-black hover:bg-gray-200 font-semibold min-w-[180px] text-center"
          >
            Ver Ropa
          </Link>
          <Link
            href="/barberia"
            className="btn-pill bg-transparent text-white border border-white hover:bg-white hover:text-black font-semibold min-w-[180px] text-center"
          >
            Barbería
          </Link>
          <Link
            href="/cosmeticos"
            className="btn-pill bg-transparent text-white border border-white hover:bg-white hover:text-black font-semibold min-w-[180px] text-center"
          >
            Cosméticos Capilares
          </Link>
        </div>
      </div>
    </section>
  );
}
