// src/components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#0A2647] to-[#003366] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Fundi<span className="text-orange-500">Connect</span>
            </h3>
            <p className="text-gray-300 text-sm">
              Connecting skilled professionals with customers across Kenya.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/fundis" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Find Fundis
                </Link>
              </li>
            </ul>
          </div>

          {/* For Fundis */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Fundis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/register" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Become a Fundi
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  How to Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-orange-400 transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} FundiConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}