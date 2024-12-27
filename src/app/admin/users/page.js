"use client";
import { useState, useEffect, useCallback, Fragment } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

export const dynamic = 'force-dynamic';

export default function AdminUsers() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Oturum süresi dolmuş');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.status === 403) {
        toast.error('Admin yetkisi gerekiyor');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Kullanıcılar yüklenirken bir hata oluştu');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!user) {
          router.push('/login');
          return;
        }

        if (user.role !== 'admin') {
          toast.error('Bu sayfaya erişim yetkiniz yok');
          router.push('/');
          return;
        }

        await fetchUsers();
      } catch (error) {
        toast.error('Yetkilendirme hatası');
        router.push('/login');
      }
    };

    checkAdminAccess();
  }, [user, router, fetchUsers]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Kullanıcı başarıyla silindi');
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı silinemedi');
      }
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      toast.error(error.message || 'Kullanıcı silinirken bir hata oluştu');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Kullanıcı hesabı doğrulandı');
        fetchUsers();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Kullanıcı doğrulanamadı');
      }
    } catch (error) {
      console.error('Kullanıcı doğrulanırken hata:', error);
      toast.error(error.message || 'Kullanıcı doğrulanırken bir hata oluştu');
    }
  };

  const handleResendVerification = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Doğrulama e-postası yeniden gönderildi');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Doğrulama e-postası gönderilemedi');
      }
    } catch (error) {
      console.error('Doğrulama e-postası gönderilirken hata:', error);
      toast.error(error.message || 'Doğrulama e-postası gönderilirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kullanıcılar</h1>
        <p className="mt-2 text-sm text-gray-600">Kayıtlı kullanıcıları yönetin</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hesap Durumu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isEmailVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isEmailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <Menu.Button className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={`/admin/users/${user._id}`}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex px-4 py-2 text-sm text-gray-700`}
                                >
                                  Detay
                                </Link>
                              )}
                            </Menu.Item>
                            {!user.isEmailVerified && (
                              <>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleVerifyUser(user._id)}
                                      className={`${
                                        active ? 'bg-gray-100' : ''
                                      } flex w-full px-4 py-2 text-sm text-green-600`}
                                    >
                                      Doğrula
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleResendVerification(user._id)}
                                      className={`${
                                        active ? 'bg-gray-100' : ''
                                      } flex w-full px-4 py-2 text-sm text-blue-600`}
                                    >
                                      E-posta Gönder
                                    </button>
                                  )}
                                </Menu.Item>
                              </>
                            )}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex w-full px-4 py-2 text-sm text-red-600`}
                                >
                                  Sil
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
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
                    <div className="font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <Menu.Button className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none">
                          <EllipsisVerticalIcon className="h-5 w-5" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={`/admin/users/${user._id}`}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex px-4 py-2 text-sm text-gray-700`}
                                >
                                  Detay
                                </Link>
                              )}
                            </Menu.Item>
                            {!user.isEmailVerified && (
                              <>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleVerifyUser(user._id)}
                                      className={`${
                                        active ? 'bg-gray-100' : ''
                                      } flex w-full px-4 py-2 text-sm text-green-600`}
                                    >
                                      Doğrula
                                    </button>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <button
                                      onClick={() => handleResendVerification(user._id)}
                                      className={`${
                                        active ? 'bg-gray-100' : ''
                                      } flex w-full px-4 py-2 text-sm text-blue-600`}
                                    >
                                      E-posta Gönder
                                    </button>
                                  )}
                                </Menu.Item>
                              </>
                            )}
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex w-full px-4 py-2 text-sm text-red-600`}
                                >
                                  Sil
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 text-gray-900">{user.email}</span>
                </div>
                
                <div className="text-sm">
                  <span className="text-gray-500">Hesap Durumu:</span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isEmailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.isEmailVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-gray-500">Kayıt Tarihi:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
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