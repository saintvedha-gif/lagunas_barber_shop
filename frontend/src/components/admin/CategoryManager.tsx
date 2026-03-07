"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil, Trash2, Plus, Check, X, Loader2,
  ChevronDown, Tag,
} from "lucide-react";
import { categoriesApi } from "@/lib/api";
import type { Category } from "@/types";

interface Props {
  ropaCategories:      (Category & { totalProductos: number })[];
  cosmeticoCategories: (Category & { totalProductos: number })[];
  token: string;
}

type Tab = "ropa" | "cosmetico";

export default function CategoryManager({ ropaCategories, cosmeticoCategories, token }: Props) {
  const router = useRouter();

  const [activeTab,      setActiveTab]      = useState<Tab>("ropa");
  const [expanded,       setExpanded]       = useState<string | null>(null);
  const [editando,       setEditando]       = useState<{ id: string; nombre: string } | null>(null);
  const [confirmDel,     setConfirmDel]     = useState<string | null>(null);
  const [addingSubcat,   setAddingSubcat]   = useState<string | null>(null);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevaSubcat,    setNuevaSubcat]    = useState("");
  const [loading,        setLoading]        = useState<string | null>(null);
  const [toast,          setToast]          = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  function showToast(msg: string, type: "ok" | "err" = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const list = activeTab === "ropa" ? ropaCategories : cosmeticoCategories;

  // ── Crear categoría ────────────────────────────────────────────────────────
  async function crear() {
    const nombre = nuevaCategoria.trim();
    if (!nombre) return;
    setLoading("crear");
    try {
      const res = await categoriesApi.create({ nombre, seccion: activeTab }, token);
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Error ${res.status}`); }
      setNuevaCategoria("");
      showToast("Categoría creada ✓");
      router.refresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error al crear.", "err");
    } finally { setLoading(null); }
  }

  // ── Renombrar ─────────────────────────────────────────────────────────────
  async function renombrar() {
    if (!editando) return;
    setLoading(`edit-${editando.id}`);
    try {
      const res = await categoriesApi.update(editando.id, editando.nombre.trim(), token);
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Error ${res.status}`); }
      setEditando(null);
      showToast("Nombre actualizado ✓");
      router.refresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error.", "err");
    } finally { setLoading(null); }
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  async function eliminar(id: string, total: number) {
    if (total > 0) {
      showToast(`Tiene ${total} producto(s) asignados.`, "err");
      setConfirmDel(null);
      return;
    }
    setLoading(`del-${id}`);
    try {
      const res = await categoriesApi.delete(id, token);
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Error ${res.status}`); }
      setConfirmDel(null);
      showToast("Categoría eliminada");
      router.refresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error.", "err");
    } finally { setLoading(null); }
  }

  // ── Agregar subcategoría ───────────────────────────────────────────────────
  async function agregarSubcat(catId: string) {
    const nombre = nuevaSubcat.trim();
    if (!nombre) return;
    setLoading(`subcat-add-${catId}`);
    try {
      const res = await categoriesApi.addSubcategoria(catId, nombre, token);
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Error ${res.status}`); }
      setNuevaSubcat("");
      setAddingSubcat(null);
      showToast("Subcategoría agregada ✓");
      router.refresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error.", "err");
    } finally { setLoading(null); }
  }

  // ── Quitar subcategoría ────────────────────────────────────────────────────
  async function quitarSubcat(catId: string, nombre: string) {
    setLoading(`subcat-del-${catId}-${nombre}`);
    try {
      const res = await categoriesApi.removeSubcategoria(catId, nombre, token);
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error ?? `Error ${res.status}`); }
      showToast("Subcategoría eliminada");
      router.refresh();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Error.", "err");
    } finally { setLoading(null); }
  }

  return (
    <div className="space-y-5">

      {/* Toast flotante */}
      {toast && (
        <div className={[
          "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl",
          "transition-all duration-300 max-w-xs",
          toast.type === "ok"
            ? "bg-[#0d2818] border border-green-700/60 text-green-300"
            : "bg-[#2a0d0d] border border-red-700/60 text-red-300",
        ].join(" ")}>
          {toast.msg}
        </div>
      )}

      {/* Tabs Ropa / Cosméticos */}
      <div className="flex bg-[#111] rounded-xl p-1 gap-1">
        {(["ropa", "cosmetico"] as const).map((tab) => {
          const n = (tab === "ropa" ? ropaCategories : cosmeticoCategories).length;
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setExpanded(null); setConfirmDel(null); setEditando(null); }}
              className={[
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab
                  ? "bg-white text-black shadow"
                  : "text-gray-400 hover:text-white",
              ].join(" ")}
            >
              {tab === "ropa" ? "Ropa" : "Cosméticos"}
              <span className={[
                "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                activeTab === tab ? "bg-black/10 text-black/70" : "bg-white/8 text-gray-500",
              ].join(" ")}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de categorías */}
      <div className="space-y-2">
        {list.length === 0 ? (
          <div className="text-center py-14 text-gray-700">
            <Tag size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sin categorías en {activeTab === "ropa" ? "Ropa" : "Cosméticos"}</p>
          </div>
        ) : list.map((cat) => (
          <div
            key={cat._id}
            className="bg-[#141414] border border-white/8 rounded-xl overflow-hidden"
          >
            {/* Cabecera del card */}
            <div className="flex items-center gap-2 px-4 py-3">

              {/* Chevron expand */}
              <button
                onClick={() => setExpanded(expanded === cat._id ? null : cat._id)}
                className="text-gray-600 hover:text-white transition-colors shrink-0"
                aria-label="Expandir subcategorías"
              >
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${expanded === cat._id ? "rotate-180" : ""}`}
                />
              </button>

              {/* Nombre / edición inline */}
              {editando?.id === cat._id ? (
                <input
                  value={editando.nombre}
                  onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")  renombrar();
                    if (e.key === "Escape") setEditando(null);
                  }}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none border-b border-white/40 py-0.5"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-white text-sm font-medium truncate">{cat.nombre}</span>
              )}

              {/* Subcategorías count pill */}
              {!editando && (cat.subcategorias?.length ?? 0) > 0 && (
                <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                  {cat.subcategorias.length} sub
                </span>
              )}

              {/* Productos count badge */}
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full shrink-0">
                {cat.totalProductos} prod
              </span>

              {/* Acciones */}
              {editando?.id === cat._id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={renombrar}
                    disabled={loading === `edit-${cat._id}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                  >
                    {loading === `edit-${cat._id}` ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  </button>
                  <button
                    onClick={() => setEditando(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : confirmDel === cat._id ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-red-400 shrink-0">¿Eliminar?</span>
                  <button
                    onClick={() => eliminar(cat._id, cat.totalProductos ?? 0)}
                    disabled={!!loading}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    {loading === `del-${cat._id}` ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  </button>
                  <button
                    onClick={() => setConfirmDel(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditando({ id: cat._id, nombre: cat.nombre }); setConfirmDel(null); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-white hover:bg-white/8 transition-colors"
                    aria-label="Editar nombre"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => { setConfirmDel(cat._id); setEditando(null); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    aria-label="Eliminar categoría"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Panel de subcategorías (expandible) */}
            {expanded === cat._id && (
              <div className="px-4 pb-4 pt-1 border-t border-white/6">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-2 mb-2.5 font-semibold">
                  Subcategorías
                </p>

                {/* Chips de subcategorías */}
                <div className="flex flex-wrap gap-1.5 mb-3 min-h-5">
                  {(cat.subcategorias ?? []).length === 0 ? (
                    <span className="text-xs text-gray-700 italic">Sin subcategorías aún</span>
                  ) : (cat.subcategorias ?? []).map((sub) => (
                    <span
                      key={sub}
                      className="flex items-center gap-1 bg-white/8 text-gray-300 text-xs px-2.5 py-1 rounded-full border border-white/10"
                    >
                      {sub}
                      <button
                        onClick={() => quitarSubcat(cat._id, sub)}
                        disabled={!!loading}
                        className="text-gray-600 hover:text-red-400 transition-colors ml-0.5"
                        aria-label={`Quitar ${sub}`}
                      >
                        {loading === `subcat-del-${cat._id}-${sub}`
                          ? <Loader2 size={10} className="animate-spin" />
                          : <X size={10} />
                        }
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input para nueva subcategoría */}
                {addingSubcat === cat._id ? (
                  <div className="flex gap-2">
                    <input
                      value={nuevaSubcat}
                      onChange={(e) => setNuevaSubcat(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")  agregarSubcat(cat._id);
                        if (e.key === "Escape") { setAddingSubcat(null); setNuevaSubcat(""); }
                      }}
                      placeholder="Nueva subcategoría..."
                      className="flex-1 bg-[#1e1e1e] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-white/30 transition-colors placeholder:text-gray-700"
                      autoFocus
                    />
                    <button
                      onClick={() => agregarSubcat(cat._id)}
                      disabled={!nuevaSubcat.trim() || !!loading}
                      className="px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
                    >
                      {loading === `subcat-add-${cat._id}` ? <Loader2 size={12} className="animate-spin" /> : "Agregar"}
                    </button>
                    <button
                      onClick={() => { setAddingSubcat(null); setNuevaSubcat(""); }}
                      className="px-2 py-1.5 text-gray-500 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingSubcat(cat._id)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-white transition-colors"
                  >
                    <Plus size={12} />
                    Agregar subcategoría
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulario: nueva categoría */}
      <div className="bg-[#111] border border-white/8 rounded-xl p-4 space-y-3">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
          Nueva categoría — {activeTab === "ropa" ? "Ropa" : "Cosméticos"}
        </p>
        <div className="flex gap-2">
          <input
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") crear(); }}
            placeholder="Nombre de la categoría..."
            className="flex-1 bg-brand-card border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-gray-700"
          />
          <button
            onClick={crear}
            disabled={!nuevaCategoria.trim() || loading === "crear"}
            className="flex items-center gap-1.5 bg-white text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {loading === "crear" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
