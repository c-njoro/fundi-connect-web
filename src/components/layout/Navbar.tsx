// src/components/layout/Navbar.tsx
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/company-logo.png"
                width={48}
                height={100}
                alt="FundiConnect logo"
                className="rounded-full mr-2"
              />
              <span className="text-2xl font-semibold text-[#0A2647]">
                Fundi<span className="text-orange-500">Connect</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/services"
              className="text-gray-700 hover:text-[#0A2647] transition-colors duration-200"
            >
              Services
            </Link>
            <Link
              href="/fundis"
              className="text-gray-700 hover:text-[#0A2647] transition-colors duration-200"
            >
              Find Fundis
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-700 hover:text-[#0A2647] transition-colors duration-200"
            >
              How it Works
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard/notifications"
                  className="relative text-gray-700 hover:text-[#0A2647] transition-colors duration-200"
                >
                  <Bell size={20} />
                  {/* Add notification badge */}
                </Link>

                <div className="relative group ">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-[#0A2647] transition-colors duration-200">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0A2647] to-[#003366] flex items-center justify-center text-white text-sm  ">
                      {user?.profile?.firstName?.[0] || "U"}
                    </div>
                    <span className="text-gray-700">
                      {user?.profile?.firstName || "User"}
                    </span>
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 w-48 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block border border-gray-200 ">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] transition-colors duration-200"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-[#0A2647] transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-[#0A2647] transition-colors duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/services"
              className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] rounded-md transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/fundis"
              className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] rounded-md transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Find Fundis
            </Link>
            <Link
              href="/how-it-works"
              className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] rounded-md transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] rounded-md transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] rounded-md transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Notifications
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] rounded-md transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] rounded-md transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-gray-700 hover:bg-orange-50 hover:text-[#0A2647] rounded-md transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
