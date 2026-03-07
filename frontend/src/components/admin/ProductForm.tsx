"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { imgUrl, productsApi } from "@/lib/api";
import type { Category, Product } from "@/types";

interface Props {
  categorias: Category[];
  token: string;
  producto?: Product; // si viene, es modo edición
}

interface GrupoColor {
  color: string;
  archivos: File[];
  previews: string[];
}

export default function ProductForm({ categorias, token, producto }: Props) {
  const router  = useRouter();
  const isEdit  = !!producto;
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [seccion, setSeccion]   = useState<"ropa" | "cosmetico">(
    producto?.seccion ?? "ropa"
  );
  const [grupos, setGrupos] = useState<GrupoColor[]>([
    { color: "", archivos: [], previews: [] },
  ]);

  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const catsFiltradas = categorias.filter((c) => c.seccion === seccion);

  function agregarGrupo() {
    setGrupos((g) => [...g, { color: "", archivos: [], previews: [] }]);
  }

  function removerGrupo(idx: number) {
    setGrupos((g) => g.filter((_, i) => i !== idx));
    // Revocar URLs
    grupos[idx]?.previews.forEach((url) => URL.revokeObjectURL(url));
  }

  function handleFiles(idx: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    const previews = arr.map((f) => URL.createObjectURL(f));
    setGrupos((g) =>
      g.map((grupo, i) =>
        i === idx
          ? { ...grupo, archivos: [...grupo.archivos, ...arr], previews: [...grupo.previews, ...previews] }
          : grupo
      )
    );
  }

  function removerImagen(grupoIdx: number, imgIdx: number) {
    URL.revokeObjectURL(grupos[grupoIdx].previews[imgIdx]);
    setGrupos((g) =>
      g.map((grupo, i) =>
        i === grupoIdx
          ? {
              ...grupo,
              archivos: grupo.archivos.filter((_, j) => j !== imgIdx),
              previews: grupo.previews.filter((_, j) => j !== imgIdx),
            }
          : grupo
      )
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    // Agregar imágenes de cada grupo con su color
    let imgIdx = 0;
    for (const grupo of grupos) {
      for (const archivo of grupo.archivos) {
        fd.append("imagenes", archivo);
        fd.append(`color_${imgIdx}`, grupo.color);
        imgIdx++;
      }
    }

    try {
      const res = isEdit
        ? await productsApi.update(producto!._id, fd, token)
        : await productsApi.create(fd, token);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Error ${res.status}`);
      }

      router.push(`/admin?tab=${seccion}&ok=${isEdit ? "editado" : "creado"}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Sección */}
      <fieldset className="space-y-4">
        <legend className="text-xs text-gray-400 uppercase tracking-widest mb-3">
          Información básica
        </legend>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Nombre *
            </label>
            <input
              name="nombre"
              required
              defaultValue={producto?.nombre}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {/* Sección */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Sección *
            </label>
            <select
              name="seccion"
              value={seccion}
              onChange={(e) => setSeccion(e.target.value as "ropa" | "cosmetico")}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
            >
              <option value="ropa">Ropa</option>
              <option value="cosmetico">Cosméticos</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Categoría
            </label>
            <select
              name="categoria"
              defaultValue={
                typeof producto?.categoria === "object"
                  ? producto.categoria?._id
                  : producto?.categoria ?? ""
              }
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
            >
              <option value="">Sin categoría</option>
              {catsFiltradas.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Precio *
            </label>
            <input
              name="precio"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={producto?.precio}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {/* Precio anterior */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Precio anterior (oferta)
            </label>
            <input
              name="precioAnterior"
              type="number"
              step="0.01"
              min="0"
              defaultValue={producto?.precioAnterior ?? ""}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Stock
            </label>
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={producto?.stock ?? 0}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {/* En oferta */}
          <div className="flex items-center gap-3">
            <input
              id="enOferta"
              name="enOferta"
              type="checkbox"
              value="1"
              defaultChecked={producto?.enOferta}
              className="w-4 h-4 accent-white"
            />
            <label htmlFor="enOferta" className="text-sm text-gray-300">
              Marcar como oferta
            </label>
          </div>
        </div>

        {/* Tallas */}
        {seccion === "ropa" && (
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
              Tallas (separadas por coma)
            </label>
            <input
              name="tallas"
              placeholder="XS, S, M, L, XL, XXL"
              defaultValue={producto?.tallas?.join(", ")}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors"
            />
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
            Descripción
          </label>
          <textarea
            name="descripcion"
            rows={3}
            defaultValue={producto?.descripcion ?? ""}
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors resize-none"
          />
        </div>
      </fieldset>

      {/* Imágenes existentes (solo edición) */}
      {isEdit && producto!.imagenes.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="text-xs text-gray-400 uppercase tracking-widest mb-3">
            Imágenes actuales
          </legend>
          <div className="flex flex-wrap gap-3">
            {producto!.imagenes.map((img) => (
              <div key={img._id} className="relative group">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                  <Image
                    src={imgUrl(img.nombreArchivo)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  {img.esPortada && (
                    <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-white/80 text-black font-bold py-0.5">
                      Portada
                    </span>
                  )}
                </div>
                {img.color && (
                  <span className="block text-[10px] text-gray-400 text-center mt-0.5 truncate w-20">
                    {img.color}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Para eliminar imágenes individuales, usa la página de edición detallada.
          </p>
        </fieldset>
      )}

      {/* Nuevas imágenes (grupos por color) */}
      <fieldset className="space-y-4">
        <div className="flex items-center justify-between">
          <legend className="text-xs text-gray-400 uppercase tracking-widest">
            {isEdit ? "Agregar nuevas imágenes" : "Imágenes"}
          </legend>
          <button
            type="button"
            onClick={agregarGrupo}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <Plus size={12} /> Agregar color
          </button>
        </div>

        {grupos.map((grupo, idx) => (
          <div key={idx} className="border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <input
                placeholder="Color (ej. Negro, Rojo, #FF0000)"
                value={grupo.color}
                onChange={(e) =>
                  setGrupos((g) =>
                    g.map((gr, i) => (i === idx ? { ...gr, color: e.target.value } : gr))
                  )
                }
                className="bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs flex-1 focus:outline-none focus:border-white/40 transition-colors"
              />
              {grupos.length > 1 && (
                <button
                  type="button"
                  onClick={() => removerGrupo(idx)}
                  className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Previews */}
            {grupo.previews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {grupo.previews.map((url, imgIdx) => (
                  <div key={imgIdx} className="relative group">
                    <div className="relative w-16 h-16 rounded overflow-hidden border border-white/10">
                      <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removerImagen(idx, imgIdx)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={8} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRefs.current[idx]?.click()}
              className="w-full border border-dashed border-white/20 rounded-lg py-3 text-xs text-gray-500 hover:text-white hover:border-white/40 transition-colors"
            >
              + Seleccionar imágenes
            </button>
            <input
              ref={(el) => { fileRefs.current[idx] = el; }}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(idx, e.target.files)}
            />
          </div>
        ))}
      </fieldset>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-white text-black font-semibold text-sm uppercase tracking-wider px-6 py-3 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-white/20 text-gray-400 text-sm rounded-lg hover:border-white hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
