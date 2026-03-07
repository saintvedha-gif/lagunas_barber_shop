import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { API_URL } from "@/lib/api";
import type { Category, Product } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

async function fetchData(id: string, token: string) {
  const [prodRes, catRes] = await Promise.all([
    fetch(`${API_URL}/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (!prodRes.ok) return null;

  const producto: Product  = await prodRes.json();
  const categorias: Category[] = catRes.ok ? await catRes.json() : [];
  return { producto, categorias };
}

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? "";
  const data = await fetchData(id, token);

  if (!data) notFound();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <h1 className="font-display text-3xl tracking-widest text-white">
        EDITAR PRODUCTO
      </h1>
      <p className="text-gray-400 text-sm">{data.producto.nombre}</p>
      <ProductForm
        categorias={data.categorias}
        token={token}
        producto={data.producto}
      />
    </div>
  );
}
