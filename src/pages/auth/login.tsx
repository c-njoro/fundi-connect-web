// src/pages/auth/login.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate Kenyan phone numbers starting with 07 and 10 digits total
    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(phone)) {
      setError(
        "Enter a valid Kenyan phone number starting with 07 and 10 digits",
      );
      setLoading(false);
      return;
    }

    try {
      await login(phone, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left Side - Branding Section - Fixed, no scroll */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A2647] to-[#003366] text-white p-8 flex-col justify-center items-center fixed left-0 top-0 h-full">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-semibold mb-4">
            Fundi <span className="text-orange-500">Connect</span>
          </h1>
          <p className="text-xl mb-8 text-gray-200">
            Connecting skilled fundis with people who need them
          </p>

          <div className="text-left space-y-4">
            <h3 className="text-xl   mb-4">Welcome Back!</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Access your dashboard</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Manage your jobs and profile</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Connect with clients and fundis</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span>Grow your business</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section - Scrollable */}
      <div className="flex-1 lg:ml-1/2 bg-gray-50 overflow-y-auto lg:col-start-2">
        <div className="min-h-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-semibold text-[#0A2647]">
                Fundi <span className="text-orange-500">Connect</span>
              </h1>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            <form
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              onSubmit={handleSubmit}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Sign In
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                    placeholder="07xxxxxxxx"
                    aria-label="Phone number"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your Kenyan phone number (07xxxxxxxx)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-900"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="mt-3">
                <Link
                  href="/auth/forgot-password"
                  className="text-[#0A2647] hover:text-orange-500 font-medium text-xs"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-orange-500 focus:ring-offset-2 transition duration-200   disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-center text-gray-600 mt-4 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-[#0A2647] hover:text-orange-500 font-medium"
                >
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
