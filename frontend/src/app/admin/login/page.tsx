"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Scissors } from "lucide-react";
import { loginAction } from "@/app/admin/actions";

export default function LoginPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const usuario  = fd.get("usuario")  as string;
    const password = fd.get("password") as string;

    try {
      await loginAction(usuario.trim(), password);
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      if (msg.includes("429") || msg.toLowerCase().includes("intentos")) {
        setError("Demasiados intentos fallidos. Espera 5 minutos e inténtalo de nuevo.");
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / título */}
        <div className="text-center mb-10">
          <Scissors className="mx-auto mb-3 text-white" size={36} />
          <h1 className="font-display text-3xl tracking-widest text-white">
            PANEL ADMIN
          </h1>
          <p className="text-gray-500 text-xs mt-1 tracking-widest uppercase">
            Laguna&apos;s Barber &amp; Shop
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuario */}
          <div>
            <label htmlFor="usuario" className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              Usuario
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              autoComplete="username"
              required
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                required
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 pr-10 text-white text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold uppercase tracking-widest text-sm py-3 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
