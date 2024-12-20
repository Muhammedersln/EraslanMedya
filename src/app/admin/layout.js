import { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Loading from "./loading";

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex min-h-screen bg-gray-50/50">
        <AdminSidebar />
        <main className="flex-1 w-full">
          <div className="min-h-screen pt-16 lg:pt-0">
            <div className="h-full p-3 sm:p-4 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </Suspense>
  );
} 