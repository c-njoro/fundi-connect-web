import { userService } from "@/lib/api/services";
import { useState } from "react";
import {
  Key,
  Loader,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

export default function SettingsPage() {
  // Change Password State
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(
    null,
  );
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<
    string | null
  >(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [passwordChangeData, setPasswordChangeData] = useState({
    oldpassword: "",
    newpassword: "",
  });

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setPasswordChangeData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordChangeData.oldpassword || !passwordChangeData.newpassword) {
      setPasswordChangeError("Both old and new passwords are required.");
      return;
    }

    if (passwordChangeData.newpassword.length < 6) {
      setPasswordChangeError("New password must be at least 6 characters.");
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordChangeError(null);
      setPasswordChangeSuccess(null);

      const response = await userService.changePassword(
        passwordChangeData.oldpassword,
        passwordChangeData.newpassword,
      );

      if (response.success) {
        setPasswordChangeSuccess("Password changed successfully.");
        setPasswordChangeData({ oldpassword: "", newpassword: "" });
      } else {
        setPasswordChangeError(
          response.message || "Failed to change password.",
        );
      }
    } catch (error) {
      console.error("Change Password Error", error);
      setPasswordChangeError("An error occurred while changing password.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Shield size={28} className="text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#0A2647]">
              Account Settings
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage your account security and preferences
          </p>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Key size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0A2647]">
                  Change Password
                </h2>
                <p className="text-gray-600 text-sm">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Old Password */}
              <div>
                <label
                  htmlFor="oldpassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    id="oldpassword"
                    name="oldpassword"
                    value={passwordChangeData.oldpassword}
                    onChange={handlePasswordInputChange}
                    disabled={changingPassword}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newpassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newpassword"
                    name="newpassword"
                    value={passwordChangeData.newpassword}
                    onChange={handlePasswordInputChange}
                    disabled={changingPassword}
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter new password (min. 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>

              {/* Error & Success Alerts */}
              {passwordChangeError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle
                    className="text-red-500 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h3 className="font-semibold text-red-800">Error</h3>
                    <p className="text-red-700 text-sm">
                      {passwordChangeError}
                    </p>
                  </div>
                </div>
              )}

              {passwordChangeSuccess && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
                  <CheckCircle
                    className="text-green-500 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h3 className="font-semibold text-green-800">Success</h3>
                    <p className="text-green-700 text-sm">
                      {passwordChangeSuccess}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#ff5722] transition-colors font-medium flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      <span>Changing Password...</span>
                    </>
                  ) : (
                    <>
                      <Key size={18} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>

                {passwordChangeData.oldpassword ||
                passwordChangeData.newpassword ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordChangeData({
                        oldpassword: "",
                        newpassword: "",
                      });
                      setPasswordChangeError(null);
                      setPasswordChangeSuccess(null);
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>

        {/* Placeholder for other settings sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          <p className="text-sm">
            Additional settings (notifications, privacy, etc.) will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
