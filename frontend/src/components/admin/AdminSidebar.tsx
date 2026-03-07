"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Scissors,
  KeyRound,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin",             label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/productos",   label: "Productos",   icon: ShoppingBag },
  { href: "/admin/categorias",  label: "Categorías",  icon: Tag },
  { href: "/admin/barberia",    label: "Barbería",    icon: Scissors },
  { href: "/admin/contrasena",  label: "Contraseña",  icon: KeyRound },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Sidebar escritorio */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-56 bg-[#111] border-r border-white/10 z-30">
        {/* Cabecera */}
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-display text-lg tracking-widest text-white">ADMIN</p>
          <p className="text-gray-500 text-[10px] tracking-widest uppercase mt-0.5">
            Laguna&apos;s Barber &amp; Shop
          </p>
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
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Barra móvil inferior */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 z-30 flex justify-around">
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
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-3 px-2 text-[10px] text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Salir
        </button>
      </nav>
    </>
  );
}
