"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Scissors,
  KeyRound,
  LogOut,
  Plus,
  ChevronRight,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/productos",  label: "Productos",   icon: ShoppingBag },
  { href: "/admin/categorias", label: "Categorías",  icon: Tag },
  { href: "/admin/barberia",   label: "Barbería",    icon: Scissors },
  { href: "/admin/contrasena", label: "Contraseña",  icon: KeyRound },
];

export default function AdminProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Cerrar al cambiar de ruta
  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleLogout() {
    await logoutAction();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      {/* Avatar botón */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
        aria-label="Menú de administrador"
      >
        <Image
          src="/img/logo-artguru.png"
          alt="Admin"
          fill
          className="object-cover"
          sizes="40px"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-56 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50">
          {/* Cabecera del menú */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 relative">
              <Image src="/img/logo-artguru.png" alt="Admin" fill className="object-cover" sizes="32px" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Administrador</p>
              <p className="text-gray-500 text-[10px] truncate">Laguna&apos;s Barber &amp; Shop</p>
            </div>
          </div>

          {/* Acción rápida */}
          <div className="px-3 pt-2">
            <Link
              href="/admin/productos/nuevo"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-black bg-white hover:bg-gray-200 transition-colors mb-1"
            >
              <Plus size={13} />
              Agregar producto
            </Link>
          </div>

          {/* Navegación */}
          <nav className="px-3 py-2 space-y-0.5">
            {LINKS.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors",
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                  ].join(" ")}
                >
                  <Icon size={13} />
                  {label}
                  {active && <ChevronRight size={11} className="ml-auto text-gray-500" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 pb-3 pt-1 border-t border-white/10 mt-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={13} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
