import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import type { Category, Color } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

async function fetchCategorias(token: string) {
  const res = await fetch(`${API_URL}/api/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok ? (res.json() as Promise<Category[]>) : [];
}

async function fetchColores() {
  const res = await fetch(`${API_URL}/api/colors`, { next: { revalidate: 60 } });
  return res.ok ? (res.json() as Promise<Color[]>) : [];
}

export default async function NuevoProductoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? "";
  const [categorias, coloresDB] = await Promise.all([
    fetchCategorias(token),
    fetchColores(),
  ]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="font-display text-3xl tracking-widest text-white">NUEVO PRODUCTO</h1>
        <p className="text-sm text-gray-500 mt-1">Completa el formulario. La vista previa se actualiza en tiempo real.</p>
      </div>
      <ProductForm categorias={categorias} coloresDB={coloresDB} token={token} />
    </div>
  );
}
