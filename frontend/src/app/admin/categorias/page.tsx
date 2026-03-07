import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import type { Category } from "@/types";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

async function fetchCategorias(token: string) {
  const res = await fetch(`${API_URL}/api/categories/with-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok ? (res.json() as Promise<(Category & { totalProductos: number })[]>) : [];
}

export default async function CategoriasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? "";
  const categorias = await fetchCategorias(token);

  const ropa      = categorias.filter((c) => c.seccion === "ropa");
  const cosmetico = categorias.filter((c) => c.seccion === "cosmetico");

  return (
    <div className="space-y-8 pb-20 md:pb-6 max-w-2xl">
      <h1 className="font-display text-3xl tracking-widest text-white">
        CATEGORÍAS
      </h1>
      <CategoryManager
        ropaCategories={ropa}
        cosmeticoCategories={cosmetico}
        token={token}
      />
    </div>
  );
}
