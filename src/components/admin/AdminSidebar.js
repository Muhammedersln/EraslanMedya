"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/users', label: 'Kullanıcılar', icon: '👥' },
  { path: '/admin/products', label: 'Ürünler', icon: '🛍️' },
  { path: '/admin/orders', label: 'Siparişler', icon: '📦' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-secondary/10 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-colors ${
              pathname === item.path
                ? 'bg-primary/10 text-primary'
                : 'text-text-light hover:bg-primary/5 hover:text-primary'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span>
          <span>Çıkış Yap</span>
        </button>
      </nav>
    </div>
  );
} 