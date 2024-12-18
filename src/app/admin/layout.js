"use client";
import { Suspense } from "react";
import { adminAuth } from "@/lib/middleware/adminAuth";
import Loading from "./loading";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }) {
  await adminAuth();

  return (
    <Suspense fallback={<Loading />}>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1">
          <div className="min-h-screen pt-16 lg:pt-0">
            <div className="h-full p-4 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </Suspense>
  );
} 