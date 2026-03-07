"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { imgUrl, productsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";

interface Props {
  productos: Product[];
  token: string;
}

export default function AdminProductTable({ productos, token }: Props) {
  const router  = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(producto: Product) {
    const ok = confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    setDeletingId(producto._id);
    try {
      const res = await productsApi.delete(producto._id, token);
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Error al eliminar el producto.");
    } finally {
      setDeletingId(null);
    }
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>No hay productos en esta sección.</p>
        <Link href="/admin/productos/nuevo" className="text-white text-sm underline mt-2 inline-block">
          Agregar el primero
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-[#111] text-gray-500 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left w-12"></th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Categoría</th>
            <th className="px-4 py-3 text-right">Precio</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">Oferta</th>
            <th className="px-4 py-3 text-center hidden sm:table-cell">Stock</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {productos.map((p) => {
            const portada = p.imagenes.find((i) => i.esPortada) ?? p.imagenes[0];
            const cat = typeof p.categoria === "object" && p.categoria ? p.categoria.nombre : "—";

            return (
              <tr key={p._id} className="hover:bg-white/5 transition-colors">
                {/* Miniatura */}
                <td className="px-4 py-3">
                  <div className="relative w-9 h-9 rounded overflow-hidden bg-[#222] shrink-0">
                    {portada ? (
                      <Image
                        src={imgUrl(portada.nombreArchivo)}
                        alt={p.nombre}
                        fill
                        className="object-cover"
                        sizes="36px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-[#333]" />
                    )}
                  </div>
                </td>

                {/* Nombre */}
                <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">
                  {p.nombre}
                </td>

                {/* Categoría */}
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{cat}</td>

                {/* Precio */}
                <td className="px-4 py-3 text-right text-[#0dcaf0] font-mono">
                  ${p.precio.toLocaleString("es-CO")}
                </td>

                {/* Oferta */}
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  {p.enOferta ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" title="En oferta" />
                  ) : (
                    <span className="inline-block w-2 h-2 rounded-full bg-white/10" />
                  )}
                </td>

                {/* Stock */}
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className={p.stock <= 3 ? "text-amber-400" : "text-gray-400"}>
                    {p.stock}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/productos/${p._id}`}
                      className="p-1.5 text-gray-400 hover:text-white rounded transition-colors hover:bg-white/10"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p._id}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors hover:bg-red-950/30 disabled:opacity-40"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
