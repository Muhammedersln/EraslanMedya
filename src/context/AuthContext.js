"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Token ile kullanıcı bilgilerini kontrol et
  const checkAuth = async (token) => {
    try {
      const response = await fetch('/api/auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      return null;
    } catch (err) {
      console.error('Auth check error:', err);
      return null;
    }
  };

  // Sayfa yüklendiğinde token kontrolü yap
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
          setLoading(false);
          if (window.location.pathname.startsWith('/admin')) {
            router.push('/login');
          }
          return;
        }

        // Önce localStorage'dan kullanıcı bilgilerini yükle
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Hemen kullanıcı bilgilerini set et
        
        // Sunucudan doğrulama yap
        const userData = await checkAuth(token);
        
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Token geçersizse veya kullanıcı bulunamazsa
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          
          // Sadece admin sayfasındaysa login'e yönlendir
          if (window.location.pathname.startsWith('/admin')) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        
        // Sadece admin sayfasındaysa login'e yönlendir
        if (window.location.pathname.startsWith('/admin')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.requiresVerification) {
          throw new Error('EMAIL_VERIFICATION_REQUIRED');
        }
        throw new Error(data.message || 'Giriş yapılırken bir hata oluştu');
      }

      const { token, user: userData } = data;

      // Kullanıcı bilgilerini ve token'ı kaydet
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt işlemi başarısız oldu.');
      }

      // Başarılı kayıt sonrası verification-pending sayfasına yönlendir
      router.push('/verification-pending');
      
      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 