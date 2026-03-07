import { cookies } from "next/headers";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import type { PaginatedProducts, Category, BarberService } from "@/types";
import {
  ShoppingBag,
  Tag,
  Scissors,
  Plus,
  ChevronRight,
  Package,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function fetchStats(token: string) {
  const headers = { Authorization: `Bearer ${token}` };

  const [ropaRes, cosmeticoRes, catRes, srvRes] = await Promise.all([
    fetch(`${API_URL}/api/products?seccion=ropa&limit=1`,      { headers }),
    fetch(`${API_URL}/api/products?seccion=cosmetico&limit=1`, { headers }),
    fetch(`${API_URL}/api/categories/with-count`,              { headers }),
    fetch(`${API_URL}/api/barber/services`,                    { headers }),
  ]);

  const ropa:      PaginatedProducts = ropaRes.ok      ? await ropaRes.json()      : { total: 0 };
  const cosmetico: PaginatedProducts = cosmeticoRes.ok ? await cosmeticoRes.json() : { total: 0 };
  const categorias: (Category & { totalProductos: number })[] = catRes.ok ? await catRes.json() : [];
  const servicios:  BarberService[]  = srvRes.ok       ? await srvRes.json()       : [];

  return {
    totalRopa:      ropa.total      ?? 0,
    totalCosmetico: cosmetico.total ?? 0,
    categorias,
    totalServicios: servicios.length,
  };
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? "";
  const stats = await fetchStats(token);

  const catRopa      = stats.categorias.filter((c) => c.seccion === "ropa");
  const catCosmetico = stats.categorias.filter((c) => c.seccion === "cosmetico");

  const okMessages: Record<string, string> = {
    creado:   "Producto creado correctamente.",
    editado:  "Producto actualizado correctamente.",
    eliminado:"Producto eliminado correctamente.",
  };

  return (
    <div className="space-y-8 pb-20 md:pb-6 max-w-5xl">
      {/* Encabezado */}
      <div>
        <h1 className="font-display text-3xl tracking-widest text-white">DASHBOARD</h1>
        <p className="text-gray-500 text-sm mt-1">Vista general del negocio</p>
      </div>

      {/* Notificación de éxito */}
      {params.ok && okMessages[params.ok] && (
        <div className="bg-green-950/50 border border-green-800/60 text-green-400 text-sm px-4 py-3 rounded-xl">
          {okMessages[params.ok]}
        </div>
      )}

      {/* ── Métricas ── */}
      <section>
        <h2 className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Resumen</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            href="/admin/productos?tab=ropa"
            icon={<ShoppingBag size={18} />}
            label="Productos Ropa"
            value={stats.totalRopa}
            color="blue"
          />
          <MetricCard
            href="/admin/productos?tab=cosmetico"
            icon={<Package size={18} />}
            label="Cosméticos"
            value={stats.totalCosmetico}
            color="purple"
          />
          <MetricCard
            href="/admin/categorias"
            icon={<Tag size={18} />}
            label="Categorías"
            value={stats.categorias.length}
            sub={`${catRopa.length} ropa · ${catCosmetico.length} cosméticos`}
            color="amber"
          />
          <MetricCard
            href="/admin/barberia"
            icon={<Scissors size={18} />}
            label="Servicios Barbería"
            value={stats.totalServicios}
            color="green"
          />
        </div>
      </section>

      {/* ── Acciones rápidas ── */}
      <section>
        <h2 className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction
            href="/admin/productos/nuevo"
            icon={<Plus size={16} />}
            label="Nuevo producto"
            sub="Agregar a ropa o cosméticos"
            primary
          />
          <QuickAction
            href="/admin/categorias"
            icon={<Layers size={16} />}
            label="Gestionar categorías"
            sub="Crear, editar o eliminar"
          />
          <QuickAction
            href="/admin/barberia"
            icon={<Scissors size={16} />}
            label="Gestionar barbería"
            sub="Servicios y portafolio"
          />
        </div>
      </section>

      {/* ── Detalles categorías ── */}
      {stats.categorias.length > 0 && (
        <section>
          <h2 className="text-[10px] text-gray-600 uppercase tracking-widest mb-3">
            Categorías activas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Ropa", items: catRopa,      href: "/admin/productos?tab=ropa",      color: "text-blue-400" },
              { label: "Cosméticos", items: catCosmetico, href: "/admin/productos?tab=cosmetico", color: "text-purple-400" },
            ].map(({ label, items, href, color }) => (
              <div key={label} className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <span className={`text-xs font-semibold uppercase tracking-widest ${color}`}>{label}</span>
                  <Link href={href} className="text-[10px] text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                    Ver productos <ChevronRight size={11} />
                  </Link>
                </div>
                <ul className="divide-y divide-white/5">
                  {items.length === 0 && (
                    <li className="px-4 py-3 text-xs text-gray-600 italic">Sin categorías</li>
                  )}
                  {items.map((cat) => (
                    <li key={cat._id}>
                      <Link
                        href={`/admin/productos?tab=${cat.seccion}&categoria=${cat._id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
                      >
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">{cat.nombre}</span>
                        <span className="text-xs text-gray-600 ml-2 shrink-0">
                          {cat.totalProductos ?? 0} productos
                          <ChevronRight size={11} className="inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Componentes locales ────────────────────────────────────────────────────────

type Color = "blue" | "purple" | "amber" | "green";

const colorMap: Record<Color, { bg: string; text: string; icon: string }> = {
  blue:   { bg: "bg-blue-950/40",   text: "text-blue-300",   icon: "text-blue-400" },
  purple: { bg: "bg-purple-950/40", text: "text-purple-300", icon: "text-purple-400" },
  amber:  { bg: "bg-amber-950/40",  text: "text-amber-300",  icon: "text-amber-400" },
  green:  { bg: "bg-green-950/40",  text: "text-green-300",  icon: "text-green-400" },
};

function MetricCard({
  href, icon, label, value, sub, color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  color: Color;
}) {
  const c = colorMap[color];
  return (
    <Link
      href={href}
      className={`group ${c.bg} border border-white/8 rounded-2xl p-4 hover:border-white/20 transition-all`}
    >
      <div className={`${c.icon} mb-3`}>{icon}</div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
      {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
      <div className="flex justify-end mt-2">
        <ChevronRight size={13} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
      </div>
    </Link>
  );
}

function QuickAction({
  href, icon, label, sub, primary,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sub: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "group flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all",
        primary
          ? "bg-white text-black border-white hover:bg-gray-100"
          : "bg-[#111] text-white border-white/8 hover:border-white/20",
      ].join(" ")}
    >
      <span className={primary ? "text-black" : "text-gray-400 group-hover:text-white transition-colors"}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${primary ? "text-black" : "text-white"}`}>{label}</p>
        <p className={`text-xs truncate ${primary ? "text-gray-600" : "text-gray-500"}`}>{sub}</p>
      </div>
      <ChevronRight size={14} className={`ml-auto shrink-0 ${primary ? "text-gray-500" : "text-gray-700 group-hover:text-gray-400"} transition-colors`} />
    </Link>
  );
}
