"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

const SECTIONS = [
  { href: "/admin/configuracion/whatsapp", label: "WhatsApp", icon: MessageCircle, desc: "Número de contacto" },
];

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-4xl">
      {/* Encabezado */}
      <div>
        <h1 className="font-display text-3xl tracking-widest text-white">CONFIGURACIÓN</h1>
        <p className="text-gray-500 text-sm mt-1">Ajustes generales del ecommerce</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Nav lateral de secciones */}
        <nav className="md:w-52 shrink-0">
          <ul className="space-y-1">
            {SECTIONS.map(({ href, label, icon: Icon, desc }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      "flex items-start gap-3 px-3 py-3 rounded-xl transition-all group",
                      active
                        ? "bg-white/10 text-white border border-white/15"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
                    ].join(" ")}
                  >
                    <Icon size={16} className="mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{label}</p>
                      <p className="text-[10px] text-gray-600 group-hover:text-gray-500 transition-colors leading-tight mt-0.5">{desc}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Contenido de la sección */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
