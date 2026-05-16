import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:flex flex-shrink-0">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="lg:hidden font-bold text-lg text-gray-900">
              Safe<span className="text-[#0F7B5A]">Rent</span>{" "}
              <span className="text-sm font-normal text-gray-500">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:inline"
            >
              ← Back to site
            </a>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0F7B5A]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#0F7B5A]">
                  {session.user.name?.charAt(0)?.toUpperCase() ?? "A"}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                {session.user.name ?? session.user.email}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
