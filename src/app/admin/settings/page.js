"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    taxRate: 0.18
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchSettings();
  }, [user, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Ayarlar yüklenemedi');
      }

      const data = await response.json();
      setSettings({ taxRate: data.taxRate || 0.18 });
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
      toast.error('Ayarlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taxRate: parseFloat(settings.taxRate)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ayarlar güncellenemedi');
      }

      toast.success('Ayarlar başarıyla güncellendi');
    } catch (error) {
      console.error('Ayarlar güncellenirken hata:', error);
      toast.error(error.message || 'Ayarlar güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Genel Ayarlar</h1>
              <p className="text-gray-500 mt-1">Sistem ayarlarını buradan yönetebilirsiniz</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KDV Oranı (%)
              </label>
              <input
                type="number"
                value={settings.taxRate * 100}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  taxRate: parseFloat(e.target.value) / 100 
                })}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                KDV oranını yüzde olarak girin (örn: 7.5)
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 