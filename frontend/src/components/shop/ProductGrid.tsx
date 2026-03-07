import ProductCard from "./ProductCard";
import type { Product } from "@/types";

interface Props {
  productos: Product[];
  modo?: "cosmetico" | "ropa";
}

export default function ProductGrid({ productos, modo = "cosmetico" }: Props) {
  if (productos.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-gray-500">
        <p className="text-lg">No se encontraron productos</p>
        <p className="text-sm mt-1">Prueba con otra categoría o búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {productos.map((p) => (
        <ProductCard key={p._id} producto={p} modo={modo} />
      ))}
    </div>
  );
}
