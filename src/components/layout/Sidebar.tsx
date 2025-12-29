// src/components/layout/Sidebar.tsx
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
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
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();

  // Smart active check that handles nested routes but excludes dashboard
  const isActive = (path: string) => {
    const currentPath = router.pathname;

    // Exact match for dashboard pages
    if (
      path.endsWith("/dashboard") ||
      path.endsWith("/dashboard/customer") ||
      path.endsWith("/dashboard/fundi") ||
      path.endsWith("/dashboard/admin")
    ) {
      return currentPath === path;
    }

    // For other routes, check if current path starts with the menu path
    // This allows /dashboard/fundi/jobs to highlight "My Jobs"
    // and /dashboard/fundi/jobs/123 to also highlight "My Jobs"
    return currentPath.startsWith(path);
  };

  // Customer menu items
  const customerMenuItems = [
    { href: "/dashboard/customer", label: "Dashboard", icon: Home },
    { href: "/dashboard/customer/jobs", label: "My Jobs", icon: Briefcase },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/customer/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  // Fundi menu items
  const fundiMenuItems = [
    { href: "/dashboard/fundi", label: "Dashboard", icon: Home },
    {
      href: "/dashboard/fundi/jobs/available",
      label: "Available Jobs",
      icon: Briefcase,
    },
    {
      href: "/dashboard/fundi/jobs/my-jobs",
      label: "My Jobs",
      icon: Briefcase,
    },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },

    {
      href: "/dashboard/fundi/availability",
      label: "Availability",
      icon: Calendar,
    },
    { href: "/dashboard/fundi/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  // Admin menu items
  const adminMenuItems = [
    { href: "/dashboard/admin", label: "Dashboard", icon: Home },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    {
      href: "/dashboard/admin/fundis/pending",
      label: "Pending Fundis",
      icon: User,
    },
    { href: "/dashboard/admin/services", label: "Services", icon: Briefcase },
    { href: "/dashboard/admin/jobs", label: "All Jobs", icon: Briefcase },

    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  // Determine which menu to show
  let menuItems = customerMenuItems;
  if (user?.role === "admin") {
    menuItems = adminMenuItems;
  } else if (user?.isFundi) {
    menuItems = fundiMenuItems;
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-md border-r border-gray-200 overflow-y-auto hidden lg:block">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                active
                  ? "bg-orange-50 text-[#0A2647] border-l-4 border-orange-500"
                  : "text-gray-700 hover:bg-orange-50 hover:text-[#0A2647]"
              }`}
            >
              <Icon
                size={20}
                className={active ? "text-orange-500" : "text-gray-500"}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
