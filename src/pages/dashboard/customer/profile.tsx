import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { userService } from "@/lib/api/services";
import { IUser } from "@/types/UserType";
import { useRouter } from "next/router";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Briefcase,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader,
} from "lucide-react";

export default function CustomerProfile() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [showBecomeFundiModal, setShowBecomeFundiModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await userService.getProfile();
        if (data.success) {
          setProfile(data.data);
          return;
        }
        setError(data.message || "Failed to load profile");
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching profile");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleBecomeFundi = async (userId: string) => {
    setUpgradeLoading(true);
    try {
      const data = await userService.becomeFundi(userId);
      if (data.success) {
        setShowBecomeFundiModal(false);
        router.reload();
        return;
      }
      alert(data.message || "Failed to process request");
    } catch (err: any) {
      alert(err.message || "An error occurred while processing request");
    } finally {
      setUpgradeLoading(false);
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateInput: string | Date) => {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (!(d instanceof Date) || isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className=" flex-1">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0A2647] to-[#003366] px-6 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-[#0A2647] text-2xl font-bold">
                  {profile.profile.avatar ? (
                    <img
                      src={profile.profile.avatar}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profile.profile.firstName} {profile.profile.lastName}
                  </h1>
                  <p className="text-gray-200">Customer Account</p>
                </div>
              </div>

              {!profile.isFundi && (
                <button
                  onClick={() => {
                    setShowBecomeFundiModal(true);
                    setSelectedUserId(profile._id.toString());
                  }}
                  className="mt-4 sm:mt-0 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold flex items-center space-x-2"
                >
                  <Briefcase size={20} />
                  <span>Become a Fundi</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {profile.fundiProfile?.profileStatus === "pending_review" && (
                <div className="mt-4 sm:mt-0 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2">
                  <Briefcase size={20} />
                  <span>Fundi Account Pending Approval</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                    <User size={20} />
                    <span>Personal Information</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">First Name:</span>
                    <span className="font-medium text-gray-900">
                      {profile.profile.firstName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Name:</span>
                    <span className="font-medium text-gray-900">
                      {profile.profile.lastName}
                    </span>
                  </div>

                  {profile.profile.gender && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {profile.profile.gender}
                      </span>
                    </div>
                  )}

                  {profile.profile.languages &&
                    profile.profile.languages.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Languages:</span>
                        <span className="font-medium text-gray-900">
                          {profile.profile.languages.join(", ")}
                        </span>
                      </div>
                    )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Profile Verified:</span>
                    <div className="flex items-center space-x-1">
                      {profile.profile.isVerified ? (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-green-600 font-medium">
                            Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-orange-500" />
                          <span className="text-orange-600 font-medium">
                            Not Verified
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                    <Mail size={20} />
                    <span>Contact Information</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <Mail size={16} />
                      <span>Email:</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {profile.email}
                      </span>
                      {profile.emailVerified ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-orange-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <Phone size={16} />
                      <span>Phone:</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {profile.phone}
                      </span>
                      {profile.phoneVerified ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-orange-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {profile.location && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                      <MapPin size={20} />
                      <span>Location Information</span>
                    </h2>
                    <button className="text-gray-500 hover:text-[#0A2647] transition-colors duration-200">
                      <Edit size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {profile.location.county && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">County:</span>
                        <span className="font-medium text-gray-900">
                          {profile.location.county}
                        </span>
                      </div>
                    )}

                    {profile.location.city && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">City:</span>
                        <span className="font-medium text-gray-900">
                          {profile.location.city}
                        </span>
                      </div>
                    )}

                    {profile.location.area && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium text-gray-900">
                          {profile.location.area}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                    <Shield size={20} />
                    <span>Account Information</span>
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {profile.role}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>

                  {profile.lastLogin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Login:</span>
                      <span className="font-medium text-gray-900">
                        {formatDateTime(profile.lastLogin)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Status:</span>
                    <div className="flex items-center space-x-1">
                      {profile.isActive ? (
                        <>
                          <CheckCircle size={16} className="text-green-500" />
                          <span className="text-green-600 font-medium">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-red-500" />
                          <span className="text-red-600 font-medium">
                            Inactive
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Become Fundi Modal */}
      {showBecomeFundiModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#0A2647] mb-4">
              Become a Fundi
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to upgrade your account to become a Fundi?
              This will give you access to start offering services and earning
              on FundiConnect.
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-orange-800 text-sm">
                <strong>Note:</strong> After upgrading, you'll need to complete
                your Fundi profile setup before you can start receiving job
                requests.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowBecomeFundiModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-medium"
                disabled={upgradeLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleBecomeFundi(selectedUserId!)}
                disabled={upgradeLoading || !selectedUserId}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
              >
                {upgradeLoading ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    <span>Upgrading...</span>
                  </>
                ) : (
                  <>
                    <Briefcase size={16} />
                    <span>Yes, Make Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
