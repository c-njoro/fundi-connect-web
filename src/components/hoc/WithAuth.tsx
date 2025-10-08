// src/components/hoc/withAuth.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface WithAuthOptions {
  requireRole?: 'customer' | 'fundi' | 'admin' | 'both';
  redirectTo?: string;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  return function ProtectedRoute(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        // Not authenticated
        if (!user) {
          router.push(options.redirectTo || '/auth/login');
          return;
        }

        // Role-based access control
        if (options.requireRole) {
          if (options.requireRole === 'admin' && user.role !== 'admin') {
            router.push('/dashboard');
          } else if (options.requireRole === 'fundi' && !user.isFundi) {
            router.push('/dashboard');
          } else if (options.requireRole === 'customer' && !user.isCustomer) {
            router.push('/dashboard');
          }
        }
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}