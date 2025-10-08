// src/components/layout/Sidebar.tsx
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  Briefcase,
  MessageSquare,
  Bell,
  User,
  DollarSign,
  Star,
  Calendar,
  Users,
  Settings,
  FileText,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  // Customer menu items
  const customerMenuItems = [
    { href: '/dashboard/customer', label: 'Dashboard', icon: Home },
    { href: '/dashboard/customer/jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/customer/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  // Fundi menu items
  const fundiMenuItems = [
    { href: '/dashboard/fundi', label: 'Dashboard', icon: Home },
    { href: '/dashboard/fundi/jobs/available', label: 'Available Jobs', icon: Briefcase },
    { href: '/dashboard/fundi/jobs/my-jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/fundi/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/dashboard/fundi/reviews', label: 'Reviews', icon: Star },
    { href: '/dashboard/fundi/availability', label: 'Availability', icon: Calendar },
    { href: '/dashboard/fundi/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  // Admin menu items
  const adminMenuItems = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: Home },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/fundis/pending', label: 'Pending Fundis', icon: User },
    { href: '/dashboard/admin/services', label: 'Services', icon: Briefcase },
    { href: '/dashboard/admin/jobs', label: 'All Jobs', icon: Briefcase },
    { href: '/dashboard/admin/reports', label: 'Reports', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  // Determine which menu to show
  let menuItems = customerMenuItems;
  if (user?.role === 'admin') {
    menuItems = adminMenuItems;
  } else if (user?.isFundi) {
    menuItems = fundiMenuItems;
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-md overflow-y-auto hidden lg:block">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}