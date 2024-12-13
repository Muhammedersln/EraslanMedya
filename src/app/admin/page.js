"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/utils/constants';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      toast.error('İstatistikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(true);
      return;
    }

    if (user.role !== 'admin') {
      router.replace('/');
      return;
    }

    fetchStats();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
        <p className="text-text-light">Hoş geldiniz, {user?.firstName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-text-light mb-1">Toplam Kullanıcı</h3>
          <p className="text-2xl font-bold text-primary">{stats.userCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-text-light mb-1">Toplam Ürün</h3>
          <p className="text-2xl font-bold text-primary">{stats.productCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-text-light mb-1">Toplam Sipariş</h3>
          <p className="text-2xl font-bold text-primary">{stats.orderCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-text-light mb-1">Toplam Gelir</h3>
          <p className="text-2xl font-bold text-primary">
            ₺{stats.totalRevenue.toLocaleString('tr-TR', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
      </div>
    </div>
  );
} 