import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAdminAuth(WrappedComponent) {
  return function WithAdminAuthComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || user.role !== 'admin')) {
        router.replace('/');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user || user.role !== 'admin') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
} 