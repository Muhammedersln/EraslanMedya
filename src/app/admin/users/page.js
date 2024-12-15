"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { API_URL } from '@/utils/constants';

export default function AdminUsers() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      toast.error('Kullanıcılar yüklenirken bir hata oluştu');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Kullanıcı başarıyla silindi');
        fetchUsers();
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      toast.error('Kullanıcı silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Kullanıcılar</h1>
        <p className="text-text-light">Kayıtlı kullanıcıları yönetin</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Ad Soyad</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Kullanıcı Adı</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-text-light">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/10">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 text-sm text-text">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-text">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-text">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-text">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4 p-4">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-lg border p-4 space-y-3">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-text">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Sil
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-1 text-text">{user.email}</span>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-500">Kayıt Tarihi:</span>
                  <span className="ml-1 text-text">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 