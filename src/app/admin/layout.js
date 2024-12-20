"use client";

import { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Loading from "./loading";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return <Loading />;
  }

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