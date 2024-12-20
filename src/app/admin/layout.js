import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 w-full">
          <div className="min-h-screen pt-16 lg:pt-0">
            <div className="h-full p-3 sm:p-4 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 