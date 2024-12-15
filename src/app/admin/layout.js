import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminAuth from "@/middleware/adminAuth";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 ">
        <div className="min-h-screen pt-16 lg:pt-0">
          <div className="h-full p-4 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 