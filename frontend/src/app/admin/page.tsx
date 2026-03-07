import { cookies } from "next/headers";
import Link from "next/link";
import { Plus, Tag, Scissors } from "lucide-react";
import { API_URL } from "@/lib/api";
import type { PaginatedProducts } from "@/types";
import AdminProductTable from "@/components/admin/AdminProductTable";

export const dynamic = "force-dynamic";

async function fetchProductos(token: string, seccion: string) {
  const res = await fetch(
    `${API_URL}/api/products?seccion=${seccion}&limit=100`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return { productos: [], total: 0, page: 1, limit: 100 };
  return res.json() as Promise<PaginatedProducts>;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; ok?: string }>;
}) {
  const params   = await searchParams;
  const tab      = params.tab ?? "ropa";
  const cookieStore = await cookies();
  const token    = cookieStore.get("auth_token")?.value ?? "";

  const data = await fetchProductos(token, tab);

  const okMessages: Record<string, string> = {
    creado:   "Producto creado correctamente.",
    editado:  "Producto actualizado correctamente.",
    eliminado:"Producto eliminado correctamente.",
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl tracking-widest text-white">
          DASHBOARD
        </h1>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-2 bg-white text-black text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus size={14} /> Agregar producto
          </Link>
          <Link
            href="/admin/categorias"
            className="flex items-center gap-2 border border-white/20 text-gray-300 text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:border-white hover:text-white transition-colors"
          >
            <Tag size={14} /> Categorías
          </Link>
          <Link
            href="/admin/barberia"
            className="flex items-center gap-2 border border-white/20 text-gray-300 text-xs uppercase tracking-wider px-4 py-2 rounded-lg hover:border-white hover:text-white transition-colors"
          >
            <Scissors size={14} /> Barbería
          </Link>
        </div>
      </div>

      {/* Notificación de éxito */}
      {params.ok && okMessages[params.ok] && (
        <div className="bg-green-950/50 border border-green-800/60 text-green-400 text-sm px-4 py-3 rounded-lg">
          {okMessages[params.ok]}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {["ropa", "cosmetico"].map((s) => (
          <Link
            key={s}
            href={`/admin?tab=${s}`}
            className={[
              "px-4 py-2 text-sm font-medium uppercase tracking-wider border-b-2 -mb-px transition-colors",
              tab === s
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300",
            ].join(" ")}
          >
            {s === "ropa" ? "Ropa" : "Cosméticos"}
          </Link>
        ))}
      </div>

      {/* Tabla */}
      <AdminProductTable productos={data.productos} token={token} />
    </div>
  );
}
