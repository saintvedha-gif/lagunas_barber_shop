import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { API_URL } from "@/lib/api";
import type { Category, Color, Product } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

async function fetchData(id: string, token: string) {
  const [prodRes, catRes, colRes] = await Promise.all([
    fetch(`${API_URL}/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_URL}/api/colors`, { next: { revalidate: 60 } }),
  ]);

  if (!prodRes.ok) return null;

  const producto: Product  = await prodRes.json();
  const categorias: Category[] = catRes.ok ? await catRes.json() : [];
  const coloresDB: Color[] = colRes.ok ? await colRes.json() : [];
  return { producto, categorias, coloresDB };
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
    <div className="space-y-4 pb-20 md:pb-8">
      <div>
        <h1 className="font-display text-3xl tracking-widest text-white">EDITAR PRODUCTO</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.producto.nombre}</p>
      </div>
      <ProductForm
        categorias={data.categorias}
        coloresDB={data.coloresDB}
        token={token}
        producto={data.producto}
      />
    </div>
  );
}
