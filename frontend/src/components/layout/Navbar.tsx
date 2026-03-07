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
  const isHome          = pathname === "/";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Fondo del navbar:
  // - Inicio mobile:  siempre transparente (el hero ya tiene logo)
  // - Inicio desktop: degradado → sólido al hacer scroll
  // - Otras rutas:    siempre sólido (mobile + desktop)
  const navBg = isHome
    ? scrolled
      ? "md:bg-black/90 md:backdrop-blur-md md:shadow-lg md:shadow-black/40"
      : "md:bg-linear-to-b md:from-black/60 md:to-transparent"
    : scrolled
      ? "bg-black/90 backdrop-blur-md shadow-lg shadow-black/40"
      : "bg-black/95 backdrop-blur-sm";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>

        {/* Logo centrado — solo mobile en rutas que no son / */}
        {!isHome && (
          <div className="md:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="pointer-events-auto flex items-center gap-2 group"
            >
              <Image
                src="/img/logo-artguru.png"
                alt="Laguna's"
                width={28}
                height={28}
                className="object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-display text-sm tracking-[0.18em] text-white leading-none">
                LAGUNA&apos;S
              </span>
            </Link>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-5 flex items-center h-17">

          {/* Logo izquierda — solo desktop */}
          <Link href="/" className="hidden md:flex items-center gap-2.5 group shrink-0">
            <Image
              src="/img/logo-artguru.png"
              alt="Laguna's Barber & Shop"
              width={42}
              height={42}
              className="object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <span className="font-display text-base tracking-[0.18em] text-white leading-none">
              LAGUNA&apos;S
            </span>
          </Link>

          {/* Links centrados — solo desktop */}
          <ul className="hidden md:flex flex-1 items-center justify-center gap-1">
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

          {/* Derecha: carrito */}
          <div className="flex items-center gap-2 ml-auto">
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
          </div>
        </div>
      </nav>

      {/* FAB hamburguesa — sólo móvil, flotante en esquina inferior-derecha */}
      <button
        className={[
          "md:hidden fixed bottom-6 right-5 z-50",
          "w-14 h-14 rounded-full",
          "flex items-center justify-center",
          "transition-all duration-300 ease-out",
          open
            ? "bg-[#1c1c1c] border border-white/20 scale-105 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_0_4px_rgba(255,255,255,0.06)]"
            : "bg-white scale-100 shadow-[0_8px_24px_rgba(0,0,0,0.5)]",
        ].join(" ")}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        <span className="relative w-6 h-6 flex items-center justify-center">
          {/* Icono Menu */}
          <Menu
            size={22}
            className={[
              "absolute transition-all duration-300 ease-out text-black",
              open ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100",
            ].join(" ")}
          />
          {/* Icono X */}
          <X
            size={22}
            className={[
              "absolute transition-all duration-300 ease-out text-white",
              open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50",
            ].join(" ")}
          />
        </span>
      </button>

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
