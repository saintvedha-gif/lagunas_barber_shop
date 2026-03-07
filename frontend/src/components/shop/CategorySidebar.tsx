"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/types";

interface Props {
  categorias: Category[];
  seccion: "ropa" | "cosmetico";
}

export default function CategorySidebar({ categorias, seccion }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catActiva = searchParams.get("categoria") ?? "todas";

  function navegar(cat: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "todas") {
      params.delete("categoria");
    } else {
      params.set("categoria", cat);
    }
    // Resetear página al cambiar categoría
    params.delete("page");
    router.push(`/${seccion === "cosmetico" ? "cosmeticos" : "ropa"}?${params.toString()}`);
  }

  return (
    <aside className="w-full md:w-56 shrink-0">
      <h2 className="font-display text-lg tracking-widest text-white mb-4 uppercase">
        Categorías
      </h2>
      <ul className="flex flex-row flex-wrap md:flex-col gap-2">
        {/* Opción "Todas" */}
        <li>
          <button
            onClick={() => navegar("todas")}
            className={[
              "w-full text-left px-3 py-2 text-sm transition-colors border-l-2 rounded-sm",
              catActiva === "todas"
                ? "border-white text-white bg-white/10"
                : "border-transparent text-gray-400 hover:text-white hover:border-white",
            ].join(" ")}
          >
            Todas
          </button>
        </li>
        {categorias.map((cat) => (
          <li key={cat._id}>
            <button
              onClick={() => navegar(cat._id)}
              className={[
                "w-full text-left px-3 py-2 text-sm transition-colors border-l-2 rounded-sm",
                catActiva === cat._id
                  ? "border-white text-white bg-white/10"
                  : "border-transparent text-gray-400 hover:text-white hover:border-white",
              ].join(" ")}
            >
              {cat.nombre}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
