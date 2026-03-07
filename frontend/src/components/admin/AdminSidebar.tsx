"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Scissors,
  KeyRound,
  Settings,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

const LINKS = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/productos",  label: "Productos",  icon: ShoppingBag },
  { href: "/admin/categorias", label: "Categorías", icon: Tag },
  { href: "/admin/barberia",   label: "Barbería",   icon: Scissors },
  { href: "/admin/contrasena", label: "Contraseña", icon: KeyRound },
];

const CONFIG_LINKS = [
  { href: "/admin/configuracion/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

const MOBILE_LINKS = [
  { href: "/admin",            label: "Inicio",   icon: LayoutDashboard },
  { href: "/admin/productos",  label: "Productos",icon: ShoppingBag },
  { href: "/admin/categorias", label: "Categ.",   icon: Tag },
  { href: "/admin/barberia",   label: "Barbería", icon: Scissors },
  { href: "/admin/configuracion/whatsapp", label: "Config.", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const configActive = pathname.startsWith("/admin/configuracion");
  const [configOpen, setConfigOpen] = useState(configActive);

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col fixed top-14 left-0 bottom-0 w-56 bg-[#111] border-r border-white/10 z-30">
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

        {/* Configuración colapsable al fondo */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <button
            onClick={() => setConfigOpen((v) => !v)}
            className={[
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              configActive
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            <Settings size={16} />
            <span className="flex-1 text-left">Configuración</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${configOpen ? "rotate-180" : ""}`}
            />
          </button>

          {configOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5">
              {CONFIG_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors",
                      active
                        ? "bg-white text-black font-semibold"
                        : "text-gray-500 hover:text-white hover:bg-white/10",
                    ].join(" ")}
                  >
                    <Icon size={13} />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Barra móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 z-30 flex items-center justify-around px-1">
        {MOBILE_LINKS.map(({ href, label, icon: Icon }) => {
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
      </nav>
    </>
  );
}
