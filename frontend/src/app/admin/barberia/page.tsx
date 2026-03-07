import { cookies } from "next/headers";
import { API_URL } from "@/lib/api";
import type { BarberService, BarberMedia } from "@/types";
import BarberiaManager from "@/components/admin/BarberiaManager";

export const dynamic = "force-dynamic";

async function fetchData(token: string) {
  const [srvRes, mediaRes] = await Promise.all([
    fetch(`${API_URL}/api/barber/services`, { headers: { Authorization: `Bearer ${token}` } }),
    fetch(`${API_URL}/api/barber/media`,    { headers: { Authorization: `Bearer ${token}` } }),
  ]);
  const servicios: BarberService[] = srvRes.ok   ? await srvRes.json()   : [];
  const media: BarberMedia[]       = mediaRes.ok  ? await mediaRes.json() : [];
  return { servicios, media };
}

export default async function AdminBarberíaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value ?? "";
  const { servicios, media } = await fetchData(token);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <h1 className="font-display text-3xl tracking-widest text-white">
        BARBERÍA
      </h1>
      <BarberiaManager servicios={servicios} media={media} token={token} />
    </div>
  );
}
