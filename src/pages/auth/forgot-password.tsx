import { resetPasswordService } from "@/lib/api/services";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Phone,
  Key,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowLeft,
} from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phone: "",
    code: "",
    newPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^07\d{8}$/;
    return phoneRegex.test(phone);
  };

  const requestCode = async () => {
    if (!formData.phone) {
      setError("Phone number is required.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError(
        "Enter a valid Kenyan phone number starting with 07 (10 digits)",
      );
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await resetPasswordService.requestReset(formData.phone);
      if (response.success) {
        setSuccess(
          response.message ||
            "Reset code sent to your phone. Please check your messages.",
        );
        // Auto-fill dev code if provided (for testing)
        if (response.dev_code) {
          setFormData((prev) => ({ ...prev, code: response.dev_code }));
        }
        setStep("reset");
      } else {
        setError(response.message || "Failed to request reset code.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to request reset code.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (!formData.phone) {
      setError("Phone number is required.");
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError(
        "Enter a valid Kenyan phone number starting with 07 (10 digits)",
      );
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await resetPasswordService.resendCode(formData.phone);
      if (response.success) {
        setSuccess(
          response.message ||
            "Reset code resent to your phone. Please check your messages.",
        );
        if (response.dev_code) {
          setFormData((prev) => ({ ...prev, code: response.dev_code }));
        }
      } else {
        setError(response.message || "Failed to resend reset code.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend reset code.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!formData.code || !formData.newPassword) {
      setError("Both reset code and new password are required.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await resetPasswordService.resetPassword(
        formData.phone,
        formData.code,
        formData.newPassword,
      );

      if (response.success) {
        setSuccess(
          response.message ||
            "Password reset successfully! Redirecting to login...",
        );
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(response.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep("request");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left Side - Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A2647] to-[#003366] text-white p-8 flex-col justify-center items-center fixed left-0 top-0 h-full">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-semibold mb-4">
            Fundi <span className="text-orange-500">Connect</span>
          </h1>
          <p className="text-xl mb-8 text-gray-200">Secure password recovery</p>

          <div className="text-left space-y-4">
            <h3 className="text-xl mb-4">
              Reset your password in 3 easy steps
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">1</span>
                </div>
                <span>Enter your registered phone number</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">2</span>
                </div>
                <span>Enter the 6-digit code sent to your phone</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">3</span>
                </div>
                <span>Create a new, strong password</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 lg:ml-1/2 bg-gray-50 overflow-y-auto lg:col-start-2">
        <div className="min-h-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-semibold text-[#0A2647]">
                Fundi <span className="text-orange-500">Connect</span>
              </h1>
              <p className="text-gray-600 mt-2">Reset your password</p>
            </div>

            {/* Form Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              {/* Back button (only on reset step) */}
              {step === "reset" && (
                <button
                  onClick={goBack}
                  className="flex items-center text-sm text-gray-600 hover:text-[#0A2647] mb-4 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to phone number
                </button>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Key size={24} className="text-orange-600" />
                </div>
                <h2 className="text-2xl font-semibold text-[#0A2647]">
                  {step === "request" ? "Forgot Password" : "Reset Password"}
                </h2>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle
                    className="text-red-500 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h3 className="font-semibold text-red-800">Error</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h3 className="font-semibold text-green-800">Success</h3>
                    <p className="text-green-700 text-sm">{success}</p>
                  </div>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  step === "request" ? requestCode() : resetPassword();
                }}
                className="space-y-6"
              >
                {/* Phone Number Field (always visible) */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="07XXXXXXXX"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Kenyan phone number starting with 07 (10 digits)
                  </p>
                </div>

                {/* Reset Step Fields (code + new password) */}
                {step === "reset" && (
                  <>
                    <div>
                      <label
                        htmlFor="code"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Reset Code *
                      </label>
                      <input
                        type="text"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="6-digit code"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        New Password *
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Min. 6 characters"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Must be at least 6 characters
                      </p>
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="space-y-3">
                  {step === "request" ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#FF6B35] text-white py-3 px-4 rounded-lg hover:bg-[#ff5722] transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin" size={18} />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <>
                          <Key size={18} />
                          <span>Request Reset Code</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#FF6B35] text-white py-3 px-4 rounded-lg hover:bg-[#ff5722] transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader className="animate-spin" size={18} />
                            <span>Resetting...</span>
                          </>
                        ) : (
                          <>
                            <Lock size={18} />
                            <span>Reset Password</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={resendCode}
                        disabled={loading}
                        className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader className="animate-spin" size={18} />
                            <span>Resending...</span>
                          </>
                        ) : (
                          <>
                            <Key size={18} />
                            <span>Resend Code</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-[#0A2647] hover:text-orange-500 font-medium transition-colors"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
