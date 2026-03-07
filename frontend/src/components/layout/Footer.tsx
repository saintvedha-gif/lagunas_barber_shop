import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111] border-t border-white/10 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Info */}
        <div className="text-center md:text-left">
          <p className="font-display text-xl tracking-widest text-white">
            LAGUNA&apos;S BARBER &amp; SHOP
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Calle 5 Av 11E-17 · Lun–Sáb 9AM–8PM
          </p>
        </div>

        {/* Links */}
        <nav className="flex gap-6 text-sm text-gray-400">
          <Link href="/"           className="hover:text-white transition-colors">Inicio</Link>
          <Link href="/ropa"       className="hover:text-white transition-colors">Ropa</Link>
          <Link href="/barberia"   className="hover:text-white transition-colors">Barbería</Link>
          <Link href="/cosmeticos" className="hover:text-white transition-colors">Cosméticos</Link>
        </nav>

        {/* Redes */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.tiktok.com/@lagunas353"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-[#67c2e6]"
            aria-label="TikTok"
          >
            {/* TikTok no está en lucide-react, usamos SVG inline */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/lagunas_barberandshop"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-[#e1306c]"
            aria-label="Instagram"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 transition-colors hover:text-[#1877f2]"
            aria-label="Facebook"
          >
            <Facebook size={18} />
          </a>
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs mt-6">
        © {new Date().getFullYear()} Laguna&apos;s Barber &amp; Shop. Todos los derechos reservados.
      </p>
    </footer>
  );
}
