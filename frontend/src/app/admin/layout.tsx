import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificación server-side adicional a proxy.ts
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar />
      <main className="flex-1 ml-0 md:ml-56 p-6 min-w-0">
        {children}
      </main>
    </div>
  );
}
