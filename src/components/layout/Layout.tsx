// src/components/layout/Layout.tsx
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Check if current page is a dashboard page
  const isDashboardPage = router.pathname.startsWith('/dashboard');
  
  // Check if current page is auth page
  const isAuthPage = router.pathname.startsWith('/auth');

  // Full layout with sidebar for dashboard pages
  if (isAuthenticated && isDashboardPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 lg:ml-64">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Simple layout for auth pages (no navbar/footer)
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Public layout (navbar + content + footer)
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}