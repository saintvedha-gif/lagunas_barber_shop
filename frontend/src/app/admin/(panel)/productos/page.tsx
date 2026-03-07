import { cookies } from "next/headers";
import Link from "next/link";
import { API_URL } from "@/lib/api";
import type { PaginatedProducts } from "@/types";
import AdminProductTable from "@/components/admin/AdminProductTable";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

async function fetchProductos(token: string, seccion: string) {
  const res = await fetch(
    `${API_URL}/api/products?seccion=${seccion}&limit=200`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) return { productos: [], total: 0 } as Pick<PaginatedProducts, "productos" | "total">;
  return res.json() as Promise<PaginatedProducts>;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; ok?: string }>;
}) {
  const params      = await searchParams;
  const tab         = params.tab === "cosmetico" ? "cosmetico" : "ropa";
  const cookieStore = await cookies();
  const token       = cookieStore.get("auth_token")?.value ?? "";

  const data = await fetchProductos(token, tab);

  const okMessages: Record<string, string> = {
    creado:   "Producto creado correctamente.",
    editado:  "Producto actualizado correctamente.",
    eliminado:"Producto eliminado.",
  };

  const TABS = [
    { key: "ropa",      label: "Ropa" },
    { key: "cosmetico", label: "Cosméticos" },
  ] as const;

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-5xl">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-widest text-white">PRODUCTOS</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data.total} {tab === "ropa" ? "prendas" : "cosméticos"}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-white text-black text-xs font-semibold uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shrink-0"
        >
          <Plus size={14} />
          Nuevo
        </Link>
      </div>

      {/* Notificación */}
      {params.ok && okMessages[params.ok] && (
        <div className="bg-green-950/50 border border-green-800/60 text-green-400 text-sm px-4 py-3 rounded-xl">
          {okMessages[params.ok]}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/10">
        {TABS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/admin/productos?tab=${key}`}
            className={[
              "px-5 py-2.5 text-sm font-medium uppercase tracking-wider border-b-2 transition-colors",
              tab === key
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300",
            ].join(" ")}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Tabla */}
      <AdminProductTable productos={data.productos} token={token} />
    </div>
  );
}
