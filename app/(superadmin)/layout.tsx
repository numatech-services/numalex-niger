import { getSessionUser } from "@/lib/utils/session";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Protection de la zone superadmin
  const user = await getSessionUser();

  // ✅ Correction : Redirection vers /login au lieu de /admin-login
  if (!user || user.role !== "superadmin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* 2. Sidebar fixe (w-64) */}
      <AdminSidebar userEmail={user.email || ""} />

      {/* 3. Contenu principal décalé de la largeur de la sidebar (ml-64) */}
      <main className="ml-64 min-h-screen">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}