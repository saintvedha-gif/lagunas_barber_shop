/**
 * Componentes de skeleton compartidos en toda la aplicación.
 * Todos usan animate-pulse sincronizado por CSS — sin "use client".
 * Geometry: cada skeleton replica exactamente el chrome del componente real.
 */

/* ─── Base pulse classes ─────────────────────────────────────────────────── */
const HI  = "bg-white/10 animate-pulse rounded-lg"; // elemento prominente
const LO  = "bg-white/5  animate-pulse rounded-lg"; // elemento secundario
const DOT = "bg-white/10 animate-pulse rounded-full"; // punto / swatch

// ─────────────────────────────────────────────────────────────────────────────
// TIENDA PÚBLICA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replica la geometría de RopaCard:
 * aspect-square | nombre×2 | precio | swatches×3 | tags×4 | botón
 */
export function SkeletonRopaCard() {
  return (
    <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden flex flex-col">
      <div className="w-full aspect-square bg-white/8 animate-pulse" />
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="space-y-1.5">
          <div className={`h-3.5 ${HI}`} />
          <div className={`h-3 ${LO} w-3/4`} />
        </div>
        <div className={`h-4 ${HI} w-2/5`} />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`w-5 h-5 ${DOT}`} />
          ))}
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-8 h-6 ${LO}`} />
          ))}
        </div>
        <div className={`h-8 ${HI} mt-auto`} />
      </div>
    </div>
  );
}

/**
 * Replica la geometría de ProductCard (cosméticos):
 * aspect-square | nombre×2 | precio | botón
 */
export function SkeletonProductCard() {
  return (
    <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden flex flex-col">
      <div className="w-full aspect-square bg-white/8 animate-pulse" />
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="space-y-1.5">
          <div className={`h-3.5 ${HI}`} />
          <div className={`h-3 ${LO} w-2/3`} />
        </div>
        <div className={`h-4 ${HI} w-1/3 mt-auto`} />
        <div className={`h-8 ${HI} mt-2`} />
      </div>
    </div>
  );
}

/**
 * Sidebar de categorías — w-56 a pantallas md+, full a mobile
 */
export function SkeletonSidebar() {
  const widths = ["w-1/2", "w-full", "w-5/6", "w-3/4", "w-4/5", "w-2/3"];
  return (
    <div className="w-full md:w-56 shrink-0 space-y-2">
      <div className={`h-3 ${HI} w-1/2 mb-4`} />
      {widths.map((w, i) => (
        <div key={i} className={`h-8 ${LO} ${w}`} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replica MetricCard del dashboard:
 * icono | número grande | label | sub | chevron
 */
export function SkeletonMetricCard() {
  return (
    <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
      <div className={`w-5 h-5 ${HI} rounded mb-3`} />
      <div className={`h-7 ${HI} w-16`} />
      <div className={`h-3 ${LO} w-24 mt-2`} />
      <div className={`h-2.5 ${LO} w-20 mt-1`} />
      <div className="flex justify-end mt-2">
        <div className={`w-3 h-3 ${LO} rounded`} />
      </div>
    </div>
  );
}

/**
 * Replica QuickAction del dashboard:
 * icono | título + subtítulo | chevron
 */
export function SkeletonQuickAction() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-white/8 bg-[#111]">
      <div className={`w-4 h-4 ${HI} rounded shrink-0`} />
      <div className="flex-1 space-y-1.5">
        <div className={`h-3.5 ${HI}`} />
        <div className={`h-3 ${LO} w-3/4`} />
      </div>
      <div className={`w-3 h-3 ${LO} rounded shrink-0`} />
    </div>
  );
}

/**
 * Replica el panel de categorías del dashboard:
 * header sticky | 4 filas de ítems
 */
export function SkeletonCategoryPanel() {
  const widths = [75, 55, 85, 65];
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className={`h-3 ${HI} w-16`} />
        <div className={`h-3 ${LO} w-20`} />
      </div>
      <ul className="divide-y divide-white/5">
        {widths.map((w, i) => (
          <li key={i} className="flex items-center justify-between px-4 py-3">
            <div className={`h-3 ${HI} animate-pulse rounded-lg`} style={{ width: `${w}%` }} />
            <div className={`h-3 ${LO} w-16 ml-2`} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — TABLA DE PRODUCTOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filas de la tabla AdminProductTable.
 * Replica: thumb | nombre | categoría | precio | oferta | stock | acciones
 */
export function SkeletonTableRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-white/5">
          <td className="px-4 py-3">
            <div className="w-9 h-9 rounded bg-white/10 animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className={`h-3 ${HI} w-40`} />
          </td>
          <td className="px-4 py-3 hidden md:table-cell">
            <div className={`h-3 ${LO} w-24`} />
          </td>
          <td className="px-4 py-3">
            <div className={`h-3 ${HI} w-16 ml-auto`} />
          </td>
          <td className="px-4 py-3 text-center hidden sm:table-cell">
            <div className={`w-4 h-4 ${DOT} mx-auto`} />
          </td>
          <td className="px-4 py-3 text-center hidden sm:table-cell">
            <div className={`h-3 ${LO} w-8 mx-auto`} />
          </td>
          <td className="px-4 py-3">
            <div className="flex gap-2 justify-center">
              <div className="w-7 h-7 rounded bg-white/10 animate-pulse" />
              <div className="w-7 h-7 rounded bg-white/8 animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — GESTIÓN DE CATEGORÍAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tarjeta de categoría en CategoryManager:
 * nombre | chips de sub | bordes redondeados
 */
export function SkeletonCategoryCard() {
  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className={`h-3.5 ${HI} w-36`} />
        <div className="flex items-center gap-2">
          <div className={`h-3 ${LO} w-12`} />
          <div className={`w-4 h-4 ${LO} rounded`} />
        </div>
      </div>
    </div>
  );
}
