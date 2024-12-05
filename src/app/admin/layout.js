import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminAuth from "@/middleware/adminAuth";

export default function AdminLayout({ children }) {
  return (
    <AdminAuth>
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AdminAuth>
  );
} 