import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import type { Category } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

async function fetchCategorias(token: string) {
  const res = await fetch(`${API_URL}/api/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok ? (res.json() as Promise<Category[]>) : [];
}

export default async function NuevoProductoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? "";
  const categorias = await fetchCategorias(token);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <h1 className="font-display text-3xl tracking-widest text-white">
        NUEVO PRODUCTO
      </h1>
      <ProductForm categorias={categorias} token={token} />
    </div>
  );
}
