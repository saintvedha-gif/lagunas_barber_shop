"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useScrolled } from "@/hooks/useScrolled";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/",           label: "Inicio" },
  { href: "/ropa",       label: "Ropa" },
  { href: "/barberia",   label: "Barbería" },
  { href: "/cosmeticos", label: "Cosméticos" },
];

export default function Navbar() {
  const scrolled   = useScrolled(30);
  const count      = useCart((s) => s.count());
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled || open ? "navbar-scrolled" : "bg-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/img/logo-artguru.png"
            alt="Laguna's Barber & Shop"
            width={90}
            height={90}
            className="object-contain transition-transform duration-200 hover:scale-105"
            priority
          />
        </Link>

        {/* Links escritorio */}
        <ul className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={[
                  "text-sm uppercase tracking-widest font-medium transition-colors duration-200",
                  pathname === link.href
                    ? "text-white border-b border-white pb-0.5"
                    : "text-gray-300 hover:text-white",
                ].join(" ")}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Carrito + hamburguesa */}
        <div className="flex items-center gap-3">
          {/* Badge carrito — solo en tiendas */}
          {(pathname === "/ropa" || pathname === "/cosmeticos") && (
            <button
              id="cart-toggle"
              aria-label="Abrir carrito"
              className="relative text-white hover:text-gray-300 transition-colors"
            >
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          )}

          {/* Hamburguesa móvil */}
          <button
            className="md:hidden flex flex-col gap-1 p-2"
            aria-label="Menú"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`block w-5 h-0.5 bg-white transition-transform duration-200 ${open ? "rotate-45 translate-y-1.5" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-white transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-5 h-0.5 bg-white transition-transform duration-200 ${open ? "-rotate-45 -translate-y-1.5" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className="md:hidden bg-black/95 border-t border-white/10 px-4 pb-4">
          <ul className="flex flex-col gap-4 pt-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "block uppercase tracking-widest text-sm font-medium transition-colors",
                    pathname === link.href ? "text-white" : "text-gray-400 hover:text-white",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
