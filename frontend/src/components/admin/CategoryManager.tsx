"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Check, X, Loader2 } from "lucide-react";
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/types";

interface Props {
  ropaCategories: (Category & { totalProductos: number })[];
  cosmeticoCategories: (Category & { totalProductos: number })[];
  token: string;
}

export default function CategoryManager({ ropaCategories, cosmeticoCategories, token }: Props) {
  const router = useRouter();
  const [nuevaRopa,      setNuevaRopa]      = useState("");
  const [nuevaCosmetico, setNuevaCosmetico] = useState("");
  const [editando,       setEditando]       = useState<{ id: string; nombre: string } | null>(null);
  const [loading,        setLoading]        = useState<string | null>(null);
  const [error,          setError]          = useState("");

  async function crear(seccion: "ropa" | "cosmetico") {
    const nombre = seccion === "ropa" ? nuevaRopa.trim() : nuevaCosmetico.trim();
    if (!nombre) return;
    setLoading(`crear-${seccion}`);
    setError("");
    try {
      const res = await categoriesApi.create({ nombre, seccion }, token);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Error ${res.status}`);
      }
      if (seccion === "ropa") setNuevaRopa(""); else setNuevaCosmetico("");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear.");
    } finally {
      setLoading(null);
    }
  }

  async function renombrar() {
    if (!editando) return;
    setLoading(`edit-${editando.id}`);
    setError("");
    try {
      const res = await categoriesApi.update(editando.id, editando.nombre.trim(), token);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Error ${res.status}`);
      }
      setEditando(null);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al renombrar.");
    } finally {
      setLoading(null);
    }
  }

  async function eliminar(id: string, nombre: string, total: number) {
    if (total > 0) {
      setError(`No puedes eliminar "${nombre}" porque tiene ${total} producto(s) asignados.`);
      return;
    }
    const ok = confirm(`¿Eliminar la categoría "${nombre}"?`);
    if (!ok) return;
    setLoading(`del-${id}`);
    setError("");
    try {
      const res = await categoriesApi.delete(id, token);
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error ?? `Error ${res.status}`);
      }
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar.");
    } finally {
      setLoading(null);
    }
  }

  function renderLista(
    list: (Category & { totalProductos: number })[],
    seccion: "ropa" | "cosmetico"
  ) {
    const nuevo = seccion === "ropa" ? nuevaRopa : nuevaCosmetico;
    const setNuevo = seccion === "ropa" ? setNuevaRopa : setNuevaCosmetico;

    return (
      <div className="space-y-3">
        <h2 className="text-xs text-gray-400 uppercase tracking-widest font-semibold border-b border-white/10 pb-2">
          {seccion === "ropa" ? "Ropa" : "Cosméticos"} ({list.length})
        </h2>

        {/* Lista */}
        <ul className="space-y-1">
          {list.map((cat) => (
            <li
              key={cat._id}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2"
            >
              {editando?.id === cat._id ? (
                <>
                  <input
                    value={editando.nombre}
                    onChange={(e) =>
                      setEditando({ ...editando, nombre: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") renombrar();
                      if (e.key === "Escape") setEditando(null);
                    }}
                    className="flex-1 bg-transparent text-white text-sm focus:outline-none border-b border-white/30"
                    autoFocus
                  />
                  <button
                    onClick={renombrar}
                    disabled={loading === `edit-${cat._id}`}
                    className="text-green-400 hover:text-green-300"
                  >
                    {loading === `edit-${cat._id}` ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => setEditando(null)}
                    className="text-gray-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-white text-sm">{cat.nombre}</span>
                  <span className="text-gray-600 text-xs">{cat.totalProductos}</span>
                  <button
                    onClick={() => setEditando({ id: cat._id, nombre: cat.nombre })}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => eliminar(cat._id, cat.nombre, cat.totalProductos)}
                    disabled={loading === `del-${cat._id}`}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1 disabled:opacity-40"
                  >
                    {loading === `del-${cat._id}` ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                  </button>
                </>
              )}
            </li>
          ))}
          {list.length === 0 && (
            <li className="text-gray-600 text-sm px-3 py-2">Sin categorías</li>
          )}
        </ul>

        {/* Nueva */}
        <div className="flex gap-2">
          <input
            value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") crear(seccion); }}
            placeholder="Nueva categoría..."
            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
          />
          <button
            onClick={() => crear(seccion)}
            disabled={!nuevo.trim() || loading === `crear-${seccion}`}
            className="flex items-center gap-1 bg-white text-black text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading === `crear-${seccion}` ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}
            Crear
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {renderLista(ropaCategories,      "ropa")}
      {renderLista(cosmeticoCategories, "cosmetico")}
    </div>
  );
}
