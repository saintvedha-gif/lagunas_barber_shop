"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus, Trash2, Loader2, ShoppingCart,
  AlertTriangle, ImageIcon, Tag, Package,
  Eye, FileText, Pipette, Crown,
} from "lucide-react";
import { imgUrl, productsApi } from "@/lib/api";
import type { Category, Product } from "@/types";

interface Props {
  categorias: Category[];
  token: string;
  producto?: Product;
}

interface GrupoColor {
  colorHex: string;    // hex del picker (visual, para el swatch)
  colorNombre: string; // nombre legible (lo que se envía al backend)
  archivos: File[];
  previews: string[];
}

interface PreviewData {
  nombre: string;
  precio: number;
  precioAnterior: number | null;
  enOferta: boolean;
  stock: number;
  tallas: string[];
  seccion: "ropa" | "cosmetico";
  categoriaNombre: string;
  grupos: GrupoColor[];
  existingImages: { url: string; color?: string | null }[];
  portadaPreviewIdx: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductPreviewCard — fiel al diseño de la tienda pública
// ─────────────────────────────────────────────────────────────────────────────
function ProductPreviewCard({
  nombre, precio, precioAnterior, enOferta, stock,
  tallas, seccion, categoriaNombre, grupos, existingImages, portadaPreviewIdx,
}: PreviewData) {
  const [tallaActiva, setTallaActiva] = useState("");
  const [imgIdx, setImgIdx]           = useState(portadaPreviewIdx);
  useEffect(() => { setImgIdx(portadaPreviewIdx); }, [portadaPreviewIdx]);

  const allImages = useMemo(() => [
    ...existingImages,
    ...grupos.flatMap((g) => g.previews.map((url) => ({ url, color: g.colorNombre || g.colorHex || null }))),
  ], [existingImages, grupos]);

  const colores = useMemo(() => {
    const seen = new Set<string>();
    const list: { label: string; hex: string }[] = [];
    grupos.forEach((g) => {
      const label = g.colorNombre || g.colorHex;
      if (label && !seen.has(label)) {
        seen.add(label);
        list.push({ label, hex: g.colorHex });
      }
    });
    existingImages.forEach((i) => {
      if (i.color && !seen.has(i.color)) {
        seen.add(i.color);
        list.push({ label: i.color, hex: i.color.startsWith("#") ? i.color : "" });
      }
    });
    return list;
  }, [grupos, existingImages]);

  const safeIdx   = Math.min(imgIdx, Math.max(allImages.length - 1, 0));
  const imgActiva = allImages[safeIdx] ?? null;
  const isAgotado = stock === 0;
  const isUltimas = stock > 0 && stock <= 3;
  const descuento =
    enOferta && precioAnterior && precioAnterior > precio && precio > 0
      ? Math.round(((precioAnterior - precio) / precioAnterior) * 100)
      : null;

  return (
    <article className="bg-brand-card border border-white/15 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 select-none">
      {/* Imagen */}
      <div className="relative w-full aspect-square bg-[#0f0f0f] overflow-hidden">
        {imgActiva ? (
          <Image
            src={imgActiva.url}
            alt={nombre || "Producto"}
            fill
            sizes="400px"
            className="object-cover transition-opacity duration-300"
            unoptimized={imgActiva.url.startsWith("blob:")}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-800 gap-2">
            <ImageIcon size={40} strokeWidth={1.2} />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        {enOferta && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10">
            Oferta
          </span>
        )}
        {isUltimas && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-amber-500/90 text-black text-[10px] font-bold uppercase px-2.5 py-1 rounded-full z-10">
            <AlertTriangle size={10} />
            Últimas
          </span>
        )}
        {isAgotado && (
          <div className="absolute inset-0 bg-black/65 flex items-center justify-center z-10">
            <span className="text-white text-sm font-semibold uppercase tracking-widest">Agotado</span>
          </div>
        )}
        {descuento && (
          <span className="absolute bottom-3 right-3 bg-green-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full z-10">
            -{descuento}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <Tag size={9} className="text-gray-700" />
          <span className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">
            {categoriaNombre || (seccion === "ropa" ? "Ropa" : "Cosméticos")}
          </span>
        </div>

        <h3 className="text-white font-medium text-sm leading-snug line-clamp-2 min-h-[2.4rem]">
          {nombre || <span className="text-gray-700 italic font-normal">Nombre del producto...</span>}
        </h3>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span className={`font-bold text-lg ${precio > 0 ? "text-brand-info" : "text-gray-700 italic text-sm"}`}>
            {precio > 0 ? `$${precio.toLocaleString("es-CO")}` : "$0"}
          </span>
          {enOferta && precioAnterior && precioAnterior > 0 && (
            <span className="text-gray-500 text-xs line-through">
              ${precioAnterior.toLocaleString("es-CO")}
            </span>
          )}
        </div>

        {seccion === "ropa" && tallas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tallas.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTallaActiva(tallaActiva === t ? "" : t)}
                className={[
                  "px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all",
                  tallaActiva === t
                    ? "border-white bg-white text-black"
                    : "border-white/20 text-gray-400 hover:border-white/50",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {colores.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-gray-700">Color:</span>
            {colores.map((c, i) => (
              <button
                key={c.label}
                type="button"
                title={c.label}
                onClick={() => setImgIdx(i)}
                className={[
                  "w-5 h-5 rounded-full border-2 transition-all duration-150 shrink-0",
                  safeIdx === i ? "border-white scale-110" : "border-transparent hover:scale-105",
                ].join(" ")}
                style={c.hex ? { backgroundColor: c.hex } : c.label ? { backgroundColor: c.label } : { background: "conic-gradient(red,yellow,green,blue,red)" }}
              />
            ))}
          </div>
        )}

        {allImages.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {allImages.slice(0, 6).map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImgIdx(i)}
                className={[
                  "relative w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-150",
                  safeIdx === i ? "border-white" : "border-transparent opacity-50 hover:opacity-80",
                ].join(" ")}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="40px"
                  unoptimized={img.url.startsWith("blob:")}
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Package size={11} className={stock > 0 ? "text-green-500" : "text-red-500"} />
          <span className={`text-[10px] font-medium ${stock > 0 ? "text-green-400" : "text-red-400"}`}>
            {isAgotado ? "Sin stock" : isUltimas
              ? `¡Solo ${stock} disponible${stock !== 1 ? "s" : ""}!`
              : `${stock} disponible${stock !== 1 ? "s" : ""}`}
          </span>
        </div>

        <button
          type="button"
          disabled={isAgotado}
          className="w-full flex items-center justify-center gap-2 bg-white text-black text-xs font-semibold uppercase tracking-wider py-2.5 rounded-xl transition-colors hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={13} />
          {isAgotado ? "Agotado" : "Añadir al carrito"}
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductForm — main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductForm({ categorias, token, producto }: Props) {
  const router = useRouter();
  const isEdit = !!producto;

  const [loading,          setLoading]        = useState(false);
  const [error,            setError]          = useState("");
  const [mobileTab,        setMobileTab]      = useState<"form" | "preview">("form");
  const [seccion,          setSeccion]        = useState<"ropa" | "cosmetico">(producto?.seccion ?? "ropa");
  const [previewNombre,    setPreviewNombre]  = useState(producto?.nombre ?? "");
  const [previewPrecio,    setPreviewPrecio]  = useState<number>(producto?.precio ?? 0);
  const [previewPrecioAnt, setPreviewPrecioAnt] = useState<number | null>(producto?.precioAnterior ?? null);
  const [previewEnOferta,  setPreviewEnOferta]  = useState(producto?.enOferta ?? false);
  const [previewStock,     setPreviewStock]   = useState<number>(producto?.stock ?? 0);
  const [previewTallas,    setPreviewTallas]  = useState(producto?.tallas?.join(", ") ?? "");
  const [previewCatId,     setPreviewCatId]   = useState<string>(
    typeof producto?.categoria === "object"
      ? producto?.categoria?._id ?? ""
      : producto?.categoria ?? ""
  );
  const [portadaKey, setPortadaKey] = useState<string>(() => {
    if (!producto) return "";
    const p = producto.imagenes.find((i) => i.esPortada);
    return p ? `existing-${p._id}` : "";
  });
  const [imgActuales, setImgActuales] = useState(producto?.imagenes ?? []);
  const [deletingImgId, setDeletingImgId] = useState<string | null>(null);
  const [grupos, setGrupos] = useState<GrupoColor[]>([{ colorHex: "#000000", colorNombre: "", archivos: [], previews: [] }]);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const catsFiltradas          = categorias.filter((c) => c.seccion === seccion);
  const categoriaNombrePreview = catsFiltradas.find((c) => c._id === previewCatId)?.nombre ?? "";
  const tallasArray            = previewTallas.split(",").map((t) => t.trim()).filter(Boolean);
  const existingImages         = imgActuales.map((img) => ({
    url: imgUrl(img.nombreArchivo),
    color: img.color,
  }));

  const portadaPreviewIdx = useMemo(() => {
    if (portadaKey.startsWith("existing-")) {
      const id = portadaKey.slice("existing-".length);
      const i = imgActuales.findIndex((img) => img._id === id);
      return i >= 0 ? i : 0;
    }
    if (portadaKey.startsWith("new-")) {
      const [, gStr, iStr] = portadaKey.split("-");
      const tg = parseInt(gStr, 10);
      const ti = parseInt(iStr, 10);
      let offset = imgActuales.length;
      for (let gi = 0; gi < tg && gi < grupos.length; gi++) offset += grupos[gi].previews.length;
      return offset + ti;
    }
    return 0;
  }, [portadaKey, grupos, imgActuales]);

  const previewData: PreviewData = {
    nombre: previewNombre,
    precio: previewPrecio,
    precioAnterior: previewPrecioAnt,
    enOferta: previewEnOferta,
    stock: previewStock,
    tallas: tallasArray,
    seccion,
    categoriaNombre: categoriaNombrePreview,
    grupos,
    existingImages,
    portadaPreviewIdx,
  };

  async function eliminarImagenExistente(imgId: string) {
    if (!producto || deletingImgId) return;
    setDeletingImgId(imgId);
    try {
      const res = await productsApi.deleteImage(producto._id, imgId, token);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      setImgActuales((prev) => prev.filter((img) => img._id !== imgId));
      if (portadaKey === `existing-${imgId}`) setPortadaKey("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar imagen.");
    } finally {
      setDeletingImgId(null);
    }
  }

  function agregarGrupo() {
    setGrupos((g) => [...g, { colorHex: "#000000", colorNombre: "", archivos: [], previews: [] }]);
  }
  function removerGrupo(idx: number) {
    grupos[idx]?.previews.forEach((url) => URL.revokeObjectURL(url));
    if (portadaKey.startsWith("new-")) {
      const [, gStr, iStr] = portadaKey.split("-");
      const pkG = parseInt(gStr, 10);
      if (pkG === idx) setPortadaKey("");
      else if (pkG > idx) setPortadaKey(`new-${pkG - 1}-${iStr}`);
    }
    setGrupos((g) => g.filter((_, i) => i !== idx));
  }
  function handleFiles(idx: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr      = Array.from(files);
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
    if (portadaKey.startsWith("new-")) {
      const [, gStr, iStr] = portadaKey.split("-");
      const pkG = parseInt(gStr, 10);
      const pkI = parseInt(iStr, 10);
      if (pkG === grupoIdx) {
        if (pkI === imgIdx) setPortadaKey("");
        else if (pkI > imgIdx) setPortadaKey(`new-${grupoIdx}-${pkI - 1}`);
      }
    }
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
    let idx = 0;
    for (const grupo of grupos) {
      for (const archivo of grupo.archivos) {
        fd.append("imagenes", archivo);
        fd.append(`color_${idx}`, grupo.colorNombre || grupo.colorHex);
        idx++;
      }
    }
    // Portada selection
    if (portadaKey.startsWith("existing-")) {
      fd.append("portadaExistenteId", portadaKey.slice("existing-".length));
    } else if (portadaKey.startsWith("new-")) {
      const [, gIdxStr, iIdxStr] = portadaKey.split("-");
      const tg = parseInt(gIdxStr, 10);
      const ti = parseInt(iIdxStr, 10);
      let flatIdx = 0;
      for (let gi = 0; gi < grupos.length; gi++) {
        for (let ii = 0; ii < grupos[gi].archivos.length; ii++) {
          if (gi === tg && ii === ti) fd.append("portadaIdx", String(flatIdx));
          flatIdx++;
        }
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
      router.push(`/admin/productos?tab=${seccion}&ok=${isEdit ? "editado" : "creado"}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-gray-700";
  const labelCls = "block text-[11px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold";

  return (
    <div>
      {/* ── Mobile Tab Switcher ─────────────────────────────────────────────── */}
      <div className="lg:hidden mb-5">
        <div className="flex bg-[#111] border border-white/8 rounded-2xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setMobileTab("form")}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              mobileTab === "form" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-white",
            ].join(" ")}
          >
            <FileText size={14} />
            Formulario
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={[
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              mobileTab === "preview" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-white",
            ].join(" ")}
          >
            <Eye size={14} />
            Vista previa
          </button>
        </div>
      </div>

      {/* ── Responsive layout ─────────────────────────────────────────────── */}
      <div className="lg:grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] lg:gap-10 lg:items-start">

        {/* ────────────── FORM PANEL ──────────────────────────────────────── */}
        <div className={mobileTab === "form" ? "block" : "hidden lg:block"}>
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Info básica */}
            <section className="space-y-4">
              <h3 className={labelCls}>Información básica</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="sm:col-span-2">
                  <label className={labelCls}>Nombre *</label>
                  <input
                    name="nombre"
                    required
                    value={previewNombre}
                    onChange={(e) => setPreviewNombre(e.target.value)}
                    placeholder="Ej. Camiseta urbana oversize negra"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Sección *</label>
                  <select
                    name="seccion"
                    value={seccion}
                    onChange={(e) => { setSeccion(e.target.value as "ropa" | "cosmetico"); setPreviewCatId(""); }}
                    className={inputCls}
                  >
                    <option value="ropa">Ropa</option>
                    <option value="cosmetico">Cosméticos</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Categoría</label>
                  <select
                    name="categoria"
                    value={previewCatId}
                    onChange={(e) => setPreviewCatId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Sin categoría</option>
                    {catsFiltradas.map((c) => (
                      <option key={c._id} value={c._id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Precio *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">$</span>
                    <input
                      name="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={previewPrecio || ""}
                      onChange={(e) => setPreviewPrecio(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Precio anterior (tachado)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">$</span>
                    <input
                      name="precioAnterior"
                      type="number"
                      step="0.01"
                      min="0"
                      value={previewPrecioAnt ?? ""}
                      onChange={(e) => setPreviewPrecioAnt(e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Solo si hay oferta"
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={previewStock}
                    onChange={(e) => setPreviewStock(parseInt(e.target.value, 10) || 0)}
                    className={inputCls}
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={previewEnOferta}
                    onClick={() => setPreviewEnOferta((v) => !v)}
                    className={[
                      "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0",
                      previewEnOferta ? "bg-white" : "bg-white/15",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 w-4 h-4 rounded-full bg-black transition-transform duration-200",
                        previewEnOferta ? "translate-x-6" : "translate-x-1",
                      ].join(" ")}
                    />
                  </button>
                  <input
                    name="enOferta"
                    type="checkbox"
                    value="1"
                    checked={previewEnOferta}
                    onChange={(e) => setPreviewEnOferta(e.target.checked)}
                    className="sr-only"
                    tabIndex={-1}
                  />
                  <span
                    className="text-sm text-gray-300 cursor-pointer select-none"
                    onClick={() => setPreviewEnOferta((v) => !v)}
                  >
                    Marcar como oferta
                  </span>
                </div>
              </div>

              {seccion === "ropa" && (
                <div>
                  <label className={labelCls}>Tallas (separadas por coma)</label>
                  <input
                    name="tallas"
                    placeholder="XS, S, M, L, XL, XXL"
                    value={previewTallas}
                    onChange={(e) => setPreviewTallas(e.target.value)}
                    className={inputCls}
                  />
                  {tallasArray.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tallasArray.map((t) => (
                        <span key={t} className="text-[11px] px-2.5 py-1 bg-white/6 rounded-lg text-gray-400 border border-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  name="descripcion"
                  rows={3}
                  defaultValue={producto?.descripcion ?? ""}
                  placeholder="Describe el producto brevemente..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </section>

            {/* Imágenes existentes — solo edición */}
            {isEdit && imgActuales.length > 0 && (
              <section className="space-y-3">
                <h3 className={labelCls}>Imágenes actuales</h3>
                <div className="flex flex-wrap gap-3">
                  {imgActuales.map((img) => {
                    const isPortada = portadaKey === `existing-${img._id}`;
                    const isDeleting = deletingImgId === img._id;
                    return (
                      <div key={img._id} className="relative group/img shrink-0">
                        <button
                          type="button"
                          onClick={() => setPortadaKey(`existing-${img._id}`)}
                          title={isPortada ? "Portada actual" : "Establecer como portada"}
                          className={[
                            "relative rounded-xl overflow-hidden transition-all",
                            isPortada ? "ring-2 ring-amber-400" : "ring-1 ring-white/10 hover:ring-white/40",
                          ].join(" ")}
                        >
                          <div className="relative w-20 h-20 bg-[#111]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgUrl(img.nombreArchivo)}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            {isPortada && (
                              <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                                <Crown size={16} className="text-amber-400" />
                              </div>
                            )}
                          </div>
                        </button>
                        {/* Botón eliminar */}
                        <button
                          type="button"
                          onClick={() => eliminarImagenExistente(img._id)}
                          disabled={isDeleting}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-10 disabled:opacity-40"
                          title="Eliminar imagen"
                        >
                          {isDeleting
                            ? <Loader2 size={10} className="animate-spin text-white" />
                            : <Trash2 size={10} className="text-white" />}
                        </button>
                        {img.color && (
                          <span className="block text-[10px] text-gray-600 text-center mt-0.5 truncate w-20 px-1">
                            {img.color}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-600 flex items-center gap-1.5">
                  <Crown size={9} className="text-amber-500/80" />
                  Toca una imagen para marcarla como portada · Pasa el cursor para eliminar
                </p>
              </section>
            )}

            {/* Nuevas imágenes */}
            <section className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={labelCls}>{isEdit ? "Agregar nuevas imágenes" : "Imágenes"}</h3>
                  <p className="text-[11px] text-gray-700 flex items-center gap-1 -mt-0.5">
                    <Crown size={9} className="text-amber-600/60" />
                    Toca para establecer portada
                  </p>
                </div>
                <button
                  type="button"
                  onClick={agregarGrupo}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 transition-colors shrink-0"
                >
                  <Plus size={12} />
                  Grupo de color
                </button>
              </div>

              <div className="space-y-3">
                {grupos.map((grupo, gIdx) => (
                  <div key={gIdx} className="border border-white/8 rounded-2xl p-4 space-y-3 bg-[#111]">
                    <div className="flex items-center gap-2">
                      {/* Círculo = color picker — click para elegir */}
                      <label
                        className="cursor-pointer shrink-0 relative group/cpicker"
                        title="Elegir color"
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/25 transition-all group-hover/cpicker:scale-110 group-hover/cpicker:border-white/60"
                          style={{ backgroundColor: grupo.colorHex || "#1a1a1a" }}
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#222] border border-white/20 rounded-full flex items-center justify-center pointer-events-none">
                          <Pipette size={8} className="text-gray-300" />
                        </span>
                        <input
                          type="color"
                          value={grupo.colorHex || "#000000"}
                          onChange={(e) => {
                            const hex = e.target.value;
                            setGrupos((g) =>
                              g.map((gr, i) =>
                                i === gIdx ? { ...gr, colorHex: hex, colorNombre: hex } : gr
                              )
                            );
                          }}
                          className="sr-only"
                        />
                      </label>
                      <input
                        placeholder="Nombre del color (ej. Negro, Azul marino)"
                        value={grupo.colorNombre}
                        onChange={(e) =>
                          setGrupos((g) => g.map((gr, i) => (i === gIdx ? { ...gr, colorNombre: e.target.value } : gr)))
                        }
                        className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-white/40 transition-colors placeholder:text-gray-700"
                      />
                      {grupos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerGrupo(gIdx)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    {grupo.previews.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {grupo.previews.map((url, iIdx) => {
                          const pk = `new-${gIdx}-${iIdx}`;
                          const isPortada = portadaKey === pk;
                          return (
                            <div key={iIdx} className="relative group/img">
                              <button
                                type="button"
                                onClick={() => setPortadaKey(pk)}
                                title={isPortada ? "Portada seleccionada" : "Marcar como portada"}
                                className={[
                                  "relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all block",
                                  isPortada ? "border-amber-400" : "border-white/10 hover:border-white/40",
                                ].join(" ")}
                              >
                                <Image src={url} alt="" fill className="object-cover" sizes="64px" unoptimized={url.startsWith("blob:")} />
                                {isPortada && (
                                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                                    <Crown size={12} className="text-amber-400" />
                                  </div>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => removerImagen(gIdx, iIdx)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
                              >
                                <Trash2 size={9} className="text-white" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileRefs.current[gIdx]?.click()}
                      className="w-full flex flex-col items-center border-2 border-dashed border-white/10 rounded-xl py-4 text-xs text-gray-700 hover:text-white hover:border-white/30 transition-all duration-200 gap-1"
                    >
                      <Plus size={14} className="opacity-50" />
                      Seleccionar imágenes
                    </button>
                    <input
                      ref={(el) => { fileRefs.current[gIdx] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(gIdx, e.target.files)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-white text-black font-semibold text-sm uppercase tracking-wider px-7 py-3 rounded-xl transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {isEdit ? "Guardar cambios" : "Crear producto"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-white/15 text-gray-500 text-sm rounded-xl hover:border-white/40 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* ────────────── PREVIEW PANEL ───────────────────────────────────── */}
        <div
          className={[
            "lg:sticky lg:top-20",
            mobileTab === "preview" ? "block" : "hidden lg:block",
          ].join(" ")}
        >
          <div className="hidden lg:flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
              Vista previa
            </p>
            <span className="text-[10px] text-gray-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              En tiempo real
            </span>
          </div>
          <p className="lg:hidden text-xs text-gray-600 text-center mb-4">
            Así se verá en la tienda pública
          </p>

          <ProductPreviewCard {...previewData} />

          <p className="hidden lg:block text-[10px] text-gray-800 text-center mt-3 leading-relaxed">
            Se actualiza mientras editas el formulario.
          </p>
        </div>

      </div>
    </div>
  );
}
