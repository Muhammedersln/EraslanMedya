import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/middleware/adminAuth";
import Loading from "./loading";
import AdminSidebar from "@/components/admin/AdminSidebar";

async function getAdminUser() {
  try {
    const headersList = await headers();
    const response = await adminAuth({ headers: headersList });
    
    if (response instanceof Response && response.status === 403) {
      redirect('/login');
    }
    
    return response;
  } catch (error) {
    console.error('Admin authentication error:', error);
    redirect('/login');
  }
}

export default async function AdminLayout({ children }) {
  await getAdminUser();

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