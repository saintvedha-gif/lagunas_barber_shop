"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { loginAction } from "@/app/admin/actions";

export default function LoginPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd       = new FormData(e.currentTarget);
    const usuario  = (fd.get("usuario")  as string).trim();
    const password = fd.get("password") as string;

    try {
      await loginAction(usuario, password, recordar);
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "429") {
        setError("Demasiados intentos fallidos. Espera 5 minutos e inténtalo de nuevo.");
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Barra superior */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} />
          Ir al inicio
        </Link>
        <div className="w-7 h-7 rounded-full overflow-hidden opacity-60">
          <Image src="/img/logo-artguru.png" alt="Logo" width={28} height={28} className="object-cover" />
        </div>
      </header>

      {/* Contenido central */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-95">

          {/* Logo + título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden border border-white/10 mb-4 shadow-lg shadow-black/40">
              <Image src="/img/logo-artguru.png" alt="Logo" width={64} height={64} className="object-cover" />
            </div>
            <h1 className="font-display text-3xl tracking-widest text-white leading-tight">
              PANEL ADMIN
            </h1>
            <p className="text-gray-500 text-[11px] tracking-widest uppercase mt-1">
              Laguna&apos;s Barber &amp; Shop
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 shadow-2xl shadow-black/60">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Usuario */}
              <div>
                <label htmlFor="usuario" className="block text-[11px] text-gray-400 uppercase tracking-widest mb-2">
                  Usuario
                </label>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  placeholder="tu_usuario"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/10 transition-all"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-[11px] text-gray-400 uppercase tracking-widest mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder-gray-700 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Recordarme */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => setRecordar((v) => !v)}
                  className={[
                    "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                    recordar
                      ? "bg-white border-white"
                      : "border-white/20 group-hover:border-white/40",
                  ].join(" ")}
                >
                  {recordar && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors select-none">
                  Mantener sesión por 30 días
                </span>
              </label>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 text-red-400 text-xs bg-red-950/30 border border-red-800/40 rounded-xl px-3 py-2.5">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold uppercase tracking-widest text-xs py-3.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1"
              >
                {loading ? (
                  <><Loader2 size={14} className="animate-spin" /> Ingresando…</>
                ) : (
                  "Ingresar"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center px-6 py-5 border-t border-white/5">
        <p className="text-gray-700 text-[11px] tracking-wider">
          © {new Date().getFullYear()} Laguna&apos;s Barber &amp; Shop — Acceso restringido
        </p>
      </footer>
    </div>
  );
}
