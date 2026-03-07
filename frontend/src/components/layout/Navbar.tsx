"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, X, Menu } from "lucide-react";
import { useScrolled } from "@/hooks/useScrolled";
import { useCart } from "@/hooks/useCart";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/",           label: "Inicio" },
  { href: "/ropa",       label: "Ropa" },
  { href: "/barberia",   label: "Barbería" },
  { href: "/cosmeticos", label: "Cosméticos" },
];

export default function Navbar() {
  const scrolled        = useScrolled(20);
  const count           = useCart((s) => s.count());
  const pathname        = usePathname();
  const [open, setOpen] = useState(false);
  const isShop          = pathname === "/ropa" || pathname === "/cosmeticos";

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black/90 backdrop-blur-md shadow-lg shadow-black/40"
            : "bg-linear-to-b from-black/60 to-transparent",
        ].join(" ")}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-17">

          {/* Logo + nombre */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <Image
              src="/img/logo-artguru.png"
              alt="Laguna's Barber & Shop"
              width={42}
              height={42}
              className="object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <span className="hidden sm:block font-display text-base tracking-[0.18em] text-white leading-none">
              LAGUNA&apos;S
            </span>
          </Link>

          {/* Links escritorio */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={[
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-white text-black"
                        : "text-gray-300 hover:text-white hover:bg-white/10",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Derecha: carrito + hamburguesa */}
          <div className="flex items-center gap-2">
            {/* Carrito — visible en páginas de tienda */}
            {isShop && (
              <button
                id="cart-toggle"
                aria-label="Abrir carrito"
                className="relative flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors"
              >
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span className="absolute top-1 right-1 bg-white text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>
            )}

            {/* Hamburguesa móvil */}
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer móvil — desliza desde el lado derecho */}
      <div
        className={[
          "fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-[#0d0d0d] z-50 md:hidden",
          "flex flex-col shadow-2xl shadow-black/60",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* Cabecera del drawer */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Image src="/img/logo-artguru.png" alt="" width={36} height={36} className="object-contain" />
            <div>
              <p className="font-display text-sm tracking-widest text-white leading-tight">LAGUNA&apos;S</p>
              <p className="text-[10px] text-gray-500 tracking-widest leading-tight">BARBER &amp; SHOP</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Links del drawer */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white hover:bg-white/8",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer del drawer */}
        <div className="px-4 pb-8 pt-4 border-t border-white/10">
          <p className="text-[10px] text-gray-700 text-center tracking-wider">
            © {new Date().getFullYear()} Laguna&apos;s Barber &amp; Shop
          </p>
        </div>
      </div>
    </>
  );
}
