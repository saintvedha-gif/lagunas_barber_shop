"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Scissors,
  KeyRound,
} from "lucide-react";
import AdminProfileMenu from "./AdminProfileMenu";

const LINKS = [
  { href: "/admin",             label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/productos",   label: "Productos",   icon: ShoppingBag },
  { href: "/admin/categorias",  label: "Categorías",  icon: Tag },
  { href: "/admin/barberia",    label: "Barbería",    icon: Scissors },
  { href: "/admin/contrasena",  label: "Contraseña",  icon: KeyRound },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 bg-[#111] border-r border-white/10 z-30">
        {/* Cabecera: textos + avatar */}
        <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-display text-lg tracking-widest text-white leading-tight">ADMIN</p>
            <p className="text-gray-500 text-[9px] tracking-widest uppercase leading-tight truncate">
              Laguna&apos;s Barber &amp; Shop
            </p>
          </div>
          <AdminProfileMenu />
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-white text-black font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/10",
                ].join(" ")}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ── Barra móvil: links + avatar a la derecha ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 z-30 flex items-center justify-around px-1">
        {LINKS.slice(0, 4).map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-col items-center gap-1 py-3 px-2 text-[10px] transition-colors",
                active ? "text-white" : "text-gray-500",
              ].join(" ")}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
        {/* Avatar en móvil */}
        <div className="py-2 px-2">
          <AdminProfileMenu />
        </div>
      </nav>
    </>
  );
}
