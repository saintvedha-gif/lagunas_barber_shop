import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import WhatsAppForm from "@/components/admin/WhatsAppForm";

export const dynamic = "force-dynamic";

export default async function WhatsAppSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? "";

  let currentValue = "573028326617";
  try {
    const res = await fetch(`${API_URL}/api/settings`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data: Record<string, string> = await res.json();
      currentValue = data["whatsapp_numero"] ?? currentValue;
    }
  } catch { /* usa fallback */ }

  return (
    <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-white font-semibold text-base">Número de WhatsApp</h2>
        <p className="text-gray-500 text-xs leading-relaxed">
          Este número se usa en el botón de compra del carrito y en la página de barbería.
          Usa formato internacional sin el <code className="text-gray-400">+</code> ni espacios
          (ej. <code className="text-gray-400">573028326617</code>).
        </p>
      </div>

      <WhatsAppForm token={token} currentValue={currentValue} />
    </div>
  );
}
