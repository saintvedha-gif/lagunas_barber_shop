"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { getTokenAction } from "@/app/admin/actions";
import { authApi } from "@/lib/api";

export default function CambiarPasswordPage() {
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [showActual, setShowActual]     = useState(false);
  const [showNueva, setShowNueva]       = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,  setError]   = useState("");
  const [ok, setOk]          = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setOk(false);

    if (form.nueva !== form.confirmar) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (form.nueva.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const token = await getTokenAction();
      if (!token) throw new Error("Sesión expirada. Inicia sesión de nuevo.");

      const res = await authApi.changePassword({ passwordActual: form.actual, passwordNuevo: form.nueva }, token);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error ?? data.message ?? "Error al cambiar la contraseña.");

      setOk(true);
      setForm({ actual: "", nueva: "", confirmar: "" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-white/40 transition-colors";

  function ToggleBtn({ show, onClick }: { show: boolean; onClick: () => void }) {
    return (
      <button type="button" onClick={onClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        tabIndex={-1}>
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    );
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-lg font-semibold text-white mb-6">Cambiar contraseña</h1>

      {ok && (
        <div className="flex items-center gap-2 text-sm text-green-400 bg-green-950/40 border border-green-800/50 rounded-lg px-3 py-2 mb-4">
          <Check size={14} /> Contraseña actualizada correctamente.
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contraseña actual */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Contraseña actual</label>
          <div className="relative">
            <input
              type={showActual ? "text" : "password"}
              value={form.actual}
              onChange={(e) => setForm({ ...form, actual: e.target.value })}
              required
              className={fieldClass}
            />
            <ToggleBtn show={showActual} onClick={() => setShowActual(!showActual)} />
          </div>
        </div>

        {/* Nueva contraseña */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Nueva contraseña</label>
          <div className="relative">
            <input
              type={showNueva ? "text" : "password"}
              value={form.nueva}
              onChange={(e) => setForm({ ...form, nueva: e.target.value })}
              required
              minLength={6}
              className={fieldClass}
            />
            <ToggleBtn show={showNueva} onClick={() => setShowNueva(!showNueva)} />
          </div>
        </div>

        {/* Confirmar */}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Confirmar nueva contraseña</label>
          <div className="relative">
            <input
              type={showConfirmar ? "text" : "password"}
              value={form.confirmar}
              onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
              required
              className={fieldClass}
            />
            <ToggleBtn show={showConfirmar} onClick={() => setShowConfirmar(!showConfirmar)} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Guardando..." : "Actualizar contraseña"}
        </button>
      </form>
    </div>
  );
}
