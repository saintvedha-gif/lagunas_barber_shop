"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MessageCircle, AlertCircle } from "lucide-react";
import { settingsApi } from "@/lib/api";

interface Props {
  token: string;
  currentValue: string;
}

export default function WhatsAppForm({ token, currentValue }: Props) {
  const router   = useRouter();
  const [value,   setValue]   = useState(currentValue);
  const [status,  setStatus]  = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [errMsg,  setErrMsg]  = useState("");

  function clean(v: string) {
    return v.replace(/[^0-9]/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = clean(value);
    if (cleaned.length < 7) {
      setErrMsg("El número debe tener al menos 7 dígitos.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    setErrMsg("");
    try {
      const res = await settingsApi.upsert("whatsapp_numero", cleaned, token);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Error al guardar");
      }
      setValue(cleaned);
      setStatus("ok");
      router.refresh();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : "Error inesperado");
      setStatus("error");
    }
  }

  const preview = value.replace(/[^0-9]/g, "");

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Campo */}
      <div>
        <label htmlFor="whatsapp" className="block text-[11px] text-gray-400 uppercase tracking-widest mb-2">
          Número (con código de país)
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
            <MessageCircle size={15} />
          </div>
          <input
            id="whatsapp"
            type="tel"
            value={value}
            onChange={(e) => { setValue(e.target.value); setStatus("idle"); }}
            placeholder="573028326617"
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/10 transition-all"
          />
        </div>
      </div>

      {/* Preview del link */}
      {preview.length > 6 && (
        <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Preview del link</p>
          <p className="text-xs text-gray-400 font-mono break-all">
            https://wa.me/<span className="text-green-400">{preview}</span>
          </p>
        </div>
      )}

      {/* Error */}
      {status === "error" && errMsg && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-800/40 rounded-xl px-3 py-2.5">
          <AlertCircle size={13} className="shrink-0" />
          {errMsg}
        </div>
      )}

      {/* Success */}
      {status === "ok" && (
        <div className="flex items-center gap-2 text-green-400 text-xs bg-green-950/30 border border-green-800/40 rounded-xl px-3 py-2.5">
          <CheckCircle2 size={13} className="shrink-0" />
          Número guardado correctamente.
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "saving"}
        className="flex items-center gap-2 bg-white text-black text-xs font-semibold uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {status === "saving" ? (
          <><Loader2 size={13} className="animate-spin" /> Guardando…</>
        ) : (
          "Guardar"
        )}
      </button>
    </form>
  );
}
