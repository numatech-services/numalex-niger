import { getSessionUser } from "@/lib/utils/session";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Protection de toute la zone superadmin
  const user = await getSessionUser();

  // Si pas connecté ou pas admin, redirection immédiate
  if (!user || user.role !== "superadmin") {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 2. Menu Latéral Fixe (Client Component) */}
      <AdminSidebar email={user.email || ""} />

      {/* 3. Zone de contenu décalée vers la droite pour laisser place à la sidebar */}
      <div className="ml-72 min-h-screen">
        {children}
      </div>
    </div>
  );
}