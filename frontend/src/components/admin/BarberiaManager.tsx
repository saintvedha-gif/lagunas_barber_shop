"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Check, X, Loader2, Upload, Link2 } from "lucide-react";
import { barberApi, imgUrl, videoUrl, toYoutubeEmbed } from "@/lib/api";
import type { BarberService, BarberMedia } from "@/types";

interface Props {
  servicios: BarberService[];
  media: BarberMedia[];
  token: string;
}

export default function BarberiaManager({ servicios, media, token }: Props) {
  const router  = useRouter();
  const [tab, setTab] = useState<"servicios" | "portafolio">("servicios");

  // ── Servicios ──────────────────────────────────────────────────────────────
  const [editSrv,  setEditSrv]   = useState<BarberService | null>(null);
  const [nuevoSrv, setNuevoSrv]  = useState({ nombre: "", precio: "", descripcion: "" });
  const [loadingSrv, setLoadingSrv] = useState<string | null>(null);
  const [errorSrv, setErrorSrv]  = useState("");
  const srvFileRef = useRef<HTMLInputElement>(null);
  const editSrvFileRef = useRef<HTMLInputElement>(null);

  async function crearServicio() {
    if (!nuevoSrv.nombre.trim() || !nuevoSrv.precio) return;
    setLoadingSrv("crear"); setErrorSrv("");
    try {
      const fd = new FormData();
      fd.append("nombre", nuevoSrv.nombre.trim());
      fd.append("precio", nuevoSrv.precio);
      if (nuevoSrv.descripcion) fd.append("descripcion", nuevoSrv.descripcion);
      const file = srvFileRef.current?.files?.[0];
      if (file) fd.append("imagen", file);
      const res = await barberApi.createService(fd, token);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      setNuevoSrv({ nombre: "", precio: "", descripcion: "" });
      if (srvFileRef.current) srvFileRef.current.value = "";
      router.refresh();
    } catch (e: unknown) { setErrorSrv(e instanceof Error ? e.message : "Error."); }
    finally { setLoadingSrv(null); }
  }

  async function editarServicio() {
    if (!editSrv) return;
    setLoadingSrv(`edit-${editSrv._id}`); setErrorSrv("");
    try {
      const fd = new FormData();
      fd.append("nombre", editSrv.nombre.trim());
      fd.append("precio", String(editSrv.precio));
      fd.append("descripcion", editSrv.descripcion || "");
      const file = editSrvFileRef.current?.files?.[0];
      if (file) fd.append("imagen", file);
      const res = await barberApi.updateService(editSrv._id, fd, token);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      setEditSrv(null);
      router.refresh();
    } catch (e: unknown) { setErrorSrv(e instanceof Error ? e.message : "Error."); }
    finally { setLoadingSrv(null); }
  }

  async function eliminarServicio(id: string, nombre: string) {
    if (!confirm(`¿Eliminar el servicio "${nombre}"?`)) return;
    setLoadingSrv(`del-${id}`); setErrorSrv("");
    try {
      const res = await barberApi.deleteService(id, token);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      router.refresh();
    } catch (e: unknown) { setErrorSrv(e instanceof Error ? e.message : "Error."); }
    finally { setLoadingSrv(null); }
  }

  // ── Portafolio ─────────────────────────────────────────────────────────────
  const [tipoMedia, setTipoMedia] = useState<"archivo" | "url">("archivo");
  const [urlMedia,  setUrlMedia]  = useState("");
  const [descMedia, setDescMedia] = useState("");
  const [loadingMedia, setLoadingMedia] = useState<string | null>(null);
  const [errorMedia, setErrorMedia] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function subirMedia() {
    setLoadingMedia("subir"); setErrorMedia("");
    try {
      const fd = new FormData();
      if (tipoMedia === "url") {
        const embed = toYoutubeEmbed(urlMedia.trim());
        fd.append("urlEmbed", embed);
        fd.append("tipo", "embed");
      } else {
        const file = fileRef.current?.files?.[0];
        if (!file) { setErrorMedia("Selecciona un archivo."); setLoadingMedia(null); return; }
        fd.append("archivo", file);
        fd.append("tipo", file.type.startsWith("video") ? "video" : "imagen");
      }
      if (descMedia.trim()) fd.append("descripcion", descMedia.trim());

      const res = await barberApi.createMedia(fd, token);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      setUrlMedia(""); setDescMedia("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e: unknown) { setErrorMedia(e instanceof Error ? e.message : "Error."); }
    finally { setLoadingMedia(null); }
  }

  async function eliminarMedia(id: string) {
    if (!confirm("¿Eliminar este elemento del portafolio?")) return;
    setLoadingMedia(`del-${id}`); setErrorMedia("");
    try {
      const res = await barberApi.deleteMedia(id, token);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Error");
      router.refresh();
    } catch (e: unknown) { setErrorMedia(e instanceof Error ? e.message : "Error."); }
    finally { setLoadingMedia(null); }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(["servicios", "portafolio"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-4 py-2 text-sm font-medium uppercase tracking-wider border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300",
            ].join(" ")}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Servicios ── */}
      {tab === "servicios" && (
        <div className="space-y-4 max-w-xl">
          {errorSrv && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
              {errorSrv}
            </p>
          )}

          {/* Lista */}
          <ul className="space-y-2">
            {servicios.map((srv) => (
              <li key={srv._id} className="bg-brand-card border border-white/10 rounded-xl p-3">
                {editSrv?._id === srv._id ? (
                  <div className="space-y-2">
                    <input
                      value={editSrv.nombre}
                      onChange={(e) => setEditSrv({ ...editSrv, nombre: e.target.value })}
                      className="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editSrv.precio}
                        onChange={(e) => setEditSrv({ ...editSrv, precio: parseFloat(e.target.value) })}
                        className="w-28 bg-transparent border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none"
                      />
                      <input
                        value={editSrv.descripcion ?? ""}
                        onChange={(e) => setEditSrv({ ...editSrv, descripcion: e.target.value })}
                        placeholder="Descripción"
                        className="flex-1 bg-transparent border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={editarServicio} disabled={loadingSrv === `edit-${srv._id}`}
                        className="flex items-center gap-1 text-xs bg-white text-black px-3 py-1.5 rounded hover:bg-gray-200 disabled:opacity-40">
                        {loadingSrv === `edit-${srv._id}` ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Guardar
                      </button>
                      <label className="flex items-center gap-1 text-xs text-gray-400 hover:text-white cursor-pointer px-2 transition-colors">
                        <Upload size={12} /> Imagen
                        <input ref={editSrvFileRef} type="file" accept="image/*" className="hidden" />
                      </label>
                      <button onClick={() => setEditSrv(null)} className="text-gray-500 hover:text-white text-xs px-2">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {srv.imagen && (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-[#222]">
                        <Image src={imgUrl(srv.imagen)} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{srv.nombre}</p>
                      {srv.descripcion && <p className="text-gray-500 text-xs mt-0.5">{srv.descripcion}</p>}
                    </div>
                    <span className="text-brand-info font-mono text-sm">
                      ${srv.precio.toLocaleString("es-CO")}
                    </span>
                    <button onClick={() => setEditSrv(srv)} className="text-gray-500 hover:text-white p-1 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => eliminarServicio(srv._id, srv.nombre)}
                      disabled={loadingSrv === `del-${srv._id}`}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors disabled:opacity-40">
                      {loadingSrv === `del-${srv._id}` ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                )}
              </li>
            ))}
            {servicios.length === 0 && (
              <li className="text-gray-600 text-sm">Sin servicios aún.</li>
            )}
          </ul>

          {/* Nuevo servicio */}
          <div className="border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Nuevo servicio</p>
            <input
              value={nuevoSrv.nombre}
              onChange={(e) => setNuevoSrv({ ...nuevoSrv, nombre: e.target.value })}
              placeholder="Nombre del servicio"
              className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={nuevoSrv.precio}
                onChange={(e) => setNuevoSrv({ ...nuevoSrv, precio: e.target.value })}
                placeholder="Precio"
                className="w-28 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
              />
              <input
                value={nuevoSrv.descripcion}
                onChange={(e) => setNuevoSrv({ ...nuevoSrv, descripcion: e.target.value })}
                placeholder="Descripción (opcional)"
                className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-400 hover:text-white cursor-pointer transition-colors">
              <Upload size={12} /> Imagen del servicio (opcional)
              <input ref={srvFileRef} type="file" accept="image/*" className="hidden" />
            </label>
            <button
              onClick={crearServicio}
              disabled={!nuevoSrv.nombre.trim() || !nuevoSrv.precio || loadingSrv === "crear"}
              className="flex items-center gap-2 bg-white text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
            >
              {loadingSrv === "crear" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Crear servicio
            </button>
          </div>
        </div>
      )}

      {/* ── Portafolio ── */}
      {tab === "portafolio" && (
        <div className="space-y-6">
          {errorMedia && (
            <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
              {errorMedia}
            </p>
          )}

          {/* Grid multimedia */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {media.map((item) => (
              <div key={item._id} className="relative group rounded-xl overflow-hidden bg-brand-card border border-white/10 aspect-square">
                {item.tipo === "imagen" && item.nombreArchivo && (
                  <Image src={imgUrl(item.nombreArchivo)} alt={item.descripcion ?? ""} fill className="object-cover" sizes="200px" />
                )}
                {item.tipo === "video" && item.nombreArchivo && (
                  <video src={videoUrl(item.nombreArchivo)} className="w-full h-full object-cover" muted loop />
                )}
                {item.tipo === "embed" && item.urlEmbed && (
                  <div className="w-full h-full flex items-center justify-center bg-[#111]">
                    <Link2 size={24} className="text-gray-500" />
                    <span className="text-[10px] text-gray-600 ml-2 truncate max-w-20">embed</span>
                  </div>
                )}
                <button
                  onClick={() => eliminarMedia(item._id)}
                  disabled={loadingMedia === `del-${item._id}`}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                >
                  {loadingMedia === `del-${item._id}` ? <Loader2 size={10} className="animate-spin text-white" /> : <Trash2 size={10} className="text-white" />}
                </button>
              </div>
            ))}
          </div>

          {/* Subir nueva media */}
          <div className="border border-white/10 rounded-xl p-4 space-y-4 max-w-lg">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Agregar al portafolio</p>

            {/* Toggle tipo */}
            <div className="flex gap-2">
              {(["archivo", "url"] as const).map((t) => (
                <button key={t} onClick={() => setTipoMedia(t)}
                  className={[
                    "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                    tipoMedia === t ? "bg-white text-black border-white" : "border-white/20 text-gray-400 hover:border-white hover:text-white",
                  ].join(" ")}
                >
                  {t === "archivo" ? <Upload size={11} /> : <Link2 size={11} />}
                  {t === "archivo" ? "Archivo" : "URL YouTube"}
                </button>
              ))}
            </div>

            {tipoMedia === "archivo" ? (
              <div
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-white/20 rounded-xl py-6 text-center text-xs text-gray-500 hover:text-white hover:border-white/40 cursor-pointer transition-colors"
              >
                <Upload size={20} className="mx-auto mb-2" />
                Clic para seleccionar imagen o video
                <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" />
              </div>
            ) : (
              <input
                value={urlMedia}
                onChange={(e) => setUrlMedia(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
              />
            )}

            <input
              value={descMedia}
              onChange={(e) => setDescMedia(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40"
            />

            <button
              onClick={subirMedia}
              disabled={loadingMedia === "subir"}
              className="flex items-center gap-2 bg-white text-black text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
            >
              {loadingMedia === "subir" ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Subir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
