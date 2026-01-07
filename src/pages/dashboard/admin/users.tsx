import { userService } from "@/lib/api/services";
import { useState, useEffect } from "react";

import {
  Search,
  Filter,
  MoreVertical,
  User,
  Shield,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Award,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Eye,
  Download,
  Edit,
  Trash2,
  Loader,
  ChevronDown,
  ChevronUp,
  Home,
  CreditCard,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
  Lock,
  Unlock,
  X,
  UserCheck,
  UserX,
  Check,
  X as XIcon,
} from "lucide-react";

type TabType = "customers" | "fundis" | "admins";
interface IUser {
  _id: string;
  id: string;

  profile: {
    firstName: string;
    lastName: string;
    avatar: string | null;
    gender: string | null;
    languages: string[];
    isVerified: boolean;
    verificationDocuments: any[];
    dateOfBirth?: string;
    fullName: string;
  };

  location: {
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat]
    };
    county: string;
    city: string;
    area: string;
  };

  fundiProfile?: {
    availability: {
      schedule: {
        monday: { available: boolean; hours?: { start: string; end: string } };
        tuesday: { available: boolean; hours?: { start: string; end: string } };
        wednesday: {
          available: boolean;
          hours?: { start: string; end: string };
        };
        thursday: {
          available: boolean;
          hours?: { start: string; end: string };
        };
        friday: { available: boolean; hours?: { start: string; end: string } };
        saturday: {
          available: boolean;
          hours?: { start: string; end: string };
        };
        sunday: { available: boolean; hours?: { start: string; end: string } };
      };
      currentStatus: "available" | "offline" | "busy";
      lastUpdated: string;
    };

    ratings: {
      average: number;
      totalReviews: number;
    };

    services: string[];
    experience: number;
    bio?: string;

    portfolio: {
      title: string;
      description: string;
      images: string[];
      completedDate: string;
    }[];

    pricing: {
      serviceId: string;
      rateType: "fixed" | "negotiable";
      minRate: number;
      maxRate: number;
      currency: string;
    }[];

    certifications: {
      name: string;
      issuedBy: string;
      dateIssued: string;
      expiryDate: string;
      certificateUrl: string;
      verified: boolean;
    }[];

    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      mpesaNumber: string;
    };

    profileStatus:
      | "draft"
      | "pending_review"
      | "approved"
      | "suspended"
      | "rejected";
    applicationDate?: string;
    approvedDate?: string;

    completedJobs: number;
    cancelledJobs: number;
    suspensionReason?: string;
  };

  email: string;
  phone: string;
  role: "customer" | "fundi" | "admin" | "both";

  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;

  isFundi: boolean;
  isCustomer: boolean;

  createdAt: string;
  updatedAt: string;
  lastLogin: string;

  __v: number;
}

interface UserModalProps {
  user: IUser;
  isOpen: boolean;
  onClose: () => void;
  onSuspend?: (userId: string) => void;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState<string>("");
  const [suspending, setSuspending] = useState<boolean>(false);
  const [suspendError, setSuspendError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("customers");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showSuspendModal, setShowSuspendModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchUsers = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      console.log("Fetched users:", data);
      if (data.success) {
        setUsers(data.data || []);
        return;
      }
      setError(data.message || "Failed to load users");
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSuspendFundi = async (userId: string) => {
    const status = "suspended";
    if (!suspendReason.trim()) {
      setSuspendError("Please provide a reason for suspension.");
      return;
    }
    const reason = suspendReason;

    setSuspending(true);
    setSuspendError(null);

    try {
      const response = await userService.updateFundiStatus(
        userId,
        status,
        reason
      );
      if (response.success) {
        console.log("Fundi suspended successfully");
        // Refresh the user list to reflect changes
        fetchUsers();
        setShowSuspendModal(false);
        setSuspendReason("");
        // Also close user modal if open
        setShowUserModal(false);
      } else {
        setSuspendError(response.message || "Failed to suspend fundi");
      }
    } catch (err: any) {
      setSuspendError(
        err.message || "An error occurred while suspending fundi"
      );
    } finally {
      setSuspending(false);
    }
  };

  const handleUnsuspendFundi = async (userId: string) => {
    const status = "approved";
    const reason = "Account reinstated by admin";

    setSuspending(true);
    setSuspendError(null);

    try {
      const response = await userService.updateFundiStatus(
        userId,
        status,
        reason
      );
      if (response.success) {
        console.log("Fundi unsuspended successfully");
        fetchUsers();
      } else {
        setSuspendError(response.message || "Failed to unsuspend fundi");
      }
    } catch (err: any) {
      setSuspendError(
        err.message || "An error occurred while unsuspending fundi"
      );
    } finally {
      setSuspending(false);
    }
  };

  const filteredUsers = users
    .filter((user) => {
      // Filter by tab
      if (activeTab === "customers" && !user.isFundi && user.role !== "admin")
        return true;
      if (activeTab === "fundis" && user.isFundi && user.role !== "admin")
        return true;
      if (activeTab === "admins" && user.role === "admin") return true;
      return false;
    })
    .filter((user) => {
      // Filter by search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        user.profile?.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        user.location?.city?.toLowerCase().includes(term) ||
        user.location?.area?.toLowerCase().includes(term)
      );
    });

  const toggleRowExpansion = (userId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (user: IUser) => {
    if (activeTab === "fundis") {
      const profileStatus = user.fundiProfile?.profileStatus;
      const isActive = user.isActive;

      if (!isActive) {
        return {
          label: "Suspended",
          color: "bg-red-100 text-red-800",
          icon: Lock,
        };
      }

      switch (profileStatus) {
        case "approved":
          return {
            label: "Approved",
            color: "bg-green-100 text-green-800",
            icon: CheckCircle,
          };
        case "pending_review":
          return {
            label: "Pending",
            color: "bg-yellow-100 text-yellow-800",
            icon: Clock,
          };
        case "rejected":
          return {
            label: "Rejected",
            color: "bg-red-100 text-red-800",
            icon: XCircle,
          };
        case "draft":
          return {
            label: "Draft",
            color: "bg-gray-100 text-gray-800",
            icon: FileText,
          };
        default:
          return {
            label: "Unknown",
            color: "bg-gray-100 text-gray-800",
            icon: AlertCircle,
          };
      }
    }

    return {
      label: user.isActive ? "Active" : "Inactive",
      color: user.isActive
        ? "bg-green-100 text-green-800"
        : "bg-gray-100 text-gray-800",
      icon: user.isActive ? CheckCircle : XCircle,
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const UserModal = ({ user, isOpen, onClose, onSuspend }: UserModalProps) => {
    if (!isOpen || !user) return null;

    const statusBadge = getStatusBadge(user);
    const StatusIcon = statusBadge.icon;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white   text-lg">
                {user.profile?.firstName?.[0]}
                {user.profile?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user.profile?.fullName}
                </h3>
                <div className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}
                  >
                    <StatusIcon size={14} />
                    <span>{statusBadge.label}</span>
                  </div>
                  {user.role === "admin" && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <Shield size={14} />
                      <span>Admin</span>
                    </div>
                  )}
                  {user.isFundi && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Wrench size={14} />
                      <span>Fundi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="  text-gray-900 text-lg flex items-center gap-2">
                  <User size={18} />
                  Basic Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-900">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium text-gray-900">
                      {user.phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {user.profile?.gender || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Languages</span>
                    <span className="font-medium text-gray-900">
                      {user.profile?.languages?.join(", ") || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h4 className="  text-gray-900 text-lg flex items-center gap-2">
                  <MapPin size={18} />
                  Location
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">County</span>
                    <span className="font-medium text-gray-900">
                      {user.location?.county || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City</span>
                    <span className="font-medium text-gray-900">
                      {user.location?.city || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area</span>
                    <span className="font-medium text-gray-900">
                      {user.location?.area || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h4 className="  text-gray-900 text-lg flex items-center gap-2">
                  <Shield size={18} />
                  Account Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {user.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(user.updatedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(user.lastLogin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Verified</span>
                    <span
                      className={`font-medium ${
                        user.emailVerified ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {user.emailVerified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone Verified</span>
                    <span
                      className={`font-medium ${
                        user.phoneVerified ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {user.phoneVerified ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fundi Specific Information */}
              {user.isFundi && user.fundiProfile && (
                <div className="space-y-4">
                  <h4 className="  text-gray-900 text-lg flex items-center gap-2">
                    <Wrench size={18} />
                    Fundi Profile
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience</span>
                      <span className="font-medium text-gray-900">
                        {user.fundiProfile.experience} years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed Jobs</span>
                      <span className="font-medium text-gray-900">
                        {user.fundiProfile.completedJobs || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancelled Jobs</span>
                      <span className="font-medium text-gray-900">
                        {user.fundiProfile.cancelledJobs || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="text-yellow-400 fill-current"
                        />
                        <span className="font-medium text-gray-900">
                          {user.fundiProfile.ratings?.average?.toFixed(1) ||
                            "0.0"}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({user.fundiProfile.ratings?.totalReviews || 0}{" "}
                          reviews)
                        </span>
                      </div>
                    </div>
                    {user.fundiProfile.suspensionReason &&
                      user.fundiProfile.profileStatus === "suspended" && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                            <AlertTriangle size={14} />
                            <span>Suspension Reason</span>
                          </div>
                          <p className="text-red-600 text-sm">
                            {user.fundiProfile.suspensionReason}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                {user.isFundi && user.isActive && (
                  <button
                    onClick={() => {
                      onClose();
                      setSelectedUser(user);
                      setShowSuspendModal(true);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors   flex items-center gap-2"
                  >
                    <Lock size={16} />
                    <span>Suspend Account</span>
                  </button>
                )}
                {user.isFundi && !user.isActive && (
                  <button
                    onClick={() => handleUnsuspendFundi(user._id)}
                    disabled={suspending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors   flex items-center gap-2"
                  >
                    {suspending ? (
                      <Loader className="animate-spin h-4 w-4" />
                    ) : (
                      <Unlock size={16} />
                    )}
                    <span>
                      {suspending ? "Unsuspending..." : "Unsuspend Account"}
                    </span>
                  </button>
                )}
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2">
                  <Edit size={16} />
                  <span>Edit User</span>
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2">
                  <FileText size={16} />
                  <span>View Activity</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SuspendModal = () => {
    if (!selectedUser || !showSuspendModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Suspend Fundi Account
              </h3>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendReason("");
                  setSuspendError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white  ">
                  {selectedUser.profile?.firstName?.[0]}
                  {selectedUser.profile?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.profile?.fullName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Suspension
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => {
                    setSuspendReason(e.target.value);
                    if (suspendError) setSuspendError(null);
                  }}
                  placeholder="Enter detailed reason for suspending this fundi account..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                  rows={4}
                />
                {suspendError && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {suspendError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSuspendReason("");
                    setSuspendError(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors  "
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSuspendFundi(selectedUser._id)}
                  disabled={suspending || !suspendReason.trim()}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {suspending ? (
                    <>
                      <Loader className="animate-spin h-4 w-4" />
                      <span>Suspending...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Suspend Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg   text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors  "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage all users, fundis, and administrators
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                />
              </div>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("customers")}
              className={`px-6 py-3   text-sm border-b-2 transition-colors ${
                activeTab === "customers"
                  ? "border-[#FF6B35] text-[#FF6B35]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>Customers</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {users.filter((u) => !u.isFundi && u.role !== "admin").length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("fundis")}
              className={`px-6 py-3   text-sm border-b-2 transition-colors ${
                activeTab === "fundis"
                  ? "border-[#FF6B35] text-[#FF6B35]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Wrench size={18} />
                <span>Fundis</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {users.filter((u) => u.isFundi && u.role !== "admin").length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("admins")}
              className={`px-6 py-3   text-sm border-b-2 transition-colors ${
                activeTab === "admins"
                  ? "border-[#FF6B35] text-[#FF6B35]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield size={18} />
                <span>Administrators</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {users.filter((u) => u.role === "admin").length}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <User size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg   text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-700 max-w-md mx-auto">
              {searchTerm.trim()
                ? `No ${activeTab} match your search criteria.`
                : `There are no ${activeTab} registered yet.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      User
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Contact
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Location
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Joined
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Actions
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900 w-12">
                      {/* Expand column */}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const statusBadge = getStatusBadge(user);
                    const StatusIcon = statusBadge.icon;
                    const isExpanded = expandedRows.has(user._id);

                    return (
                      <>
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white  ">
                                {user.profile?.firstName?.[0]}
                                {user.profile?.lastName?.[0]}
                              </div>
                              <div>
                                <p className="  text-gray-900">
                                  {user.profile?.fullName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {user.isFundi && (
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                                      <Wrench size={10} />
                                      Fundi
                                    </span>
                                  )}
                                  {user.role === "admin" && (
                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                                      <Shield size={10} />
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                <span className="text-gray-900">
                                  {user.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-gray-900">
                                  {user.phone}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="text-gray-900">
                                  {user.location?.city || "N/A"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700">
                                {user.location?.area}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}
                            >
                              <StatusIcon size={14} />
                              <span>{statusBadge.label}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <span className="text-gray-900">
                                {formatDate(user.createdAt)}
                              </span>
                              <div className="text-sm text-gray-700">
                                Last: {formatDate(user.lastLogin)}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                              >
                                <Eye size={14} />
                                <span>View</span>
                              </button>
                              {user.isFundi && !user.isActive && (
                                <button
                                  onClick={() => handleUnsuspendFundi(user._id)}
                                  disabled={suspending}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                                >
                                  {suspending ? (
                                    <Loader className="animate-spin h-3 w-3" />
                                  ) : (
                                    <Unlock size={14} />
                                  )}
                                  <span>Unsuspend</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => toggleRowExpansion(user._id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="bg-gray-50 px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <h4 className="  text-gray-900 mb-2">
                                    Verification
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Email Verified
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          user.emailVerified
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {user.emailVerified ? "Yes ✓" : "No ✗"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Phone Verified
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          user.phoneVerified
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {user.phoneVerified ? "Yes ✓" : "No ✗"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Profile Verified
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          user.profile?.isVerified
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {user.profile?.isVerified
                                          ? "Yes ✓"
                                          : "No ✗"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="  text-gray-900 mb-2">
                                    Activity
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Account Status
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          user.isActive
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {user.isActive ? "Active" : "Suspended"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Last Login
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatDate(user.lastLogin)}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Updated
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatDate(user.updatedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="  text-gray-900 mb-2">
                                    Quick Actions
                                  </h4>
                                  <div className="space-y-2">
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setShowUserModal(true);
                                      }}
                                      className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                    >
                                      View Full Details
                                    </button>
                                    {user.isFundi && user.isActive && (
                                      <button
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setShowSuspendModal(true);
                                        }}
                                        className="w-full text-left px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                      >
                                        Suspend Account
                                      </button>
                                    )}
                                    <button className="w-full text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                      Message User
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-gray-700">
                  Showing{" "}
                  <span className="  text-gray-900">
                    {filteredUsers.length}
                  </span>{" "}
                  of{" "}
                  <span className="  text-gray-900">
                    {
                      users.filter((u) => {
                        if (activeTab === "customers")
                          return !u.isFundi && u.role !== "admin";
                        if (activeTab === "fundis")
                          return u.isFundi && u.role !== "admin";
                        if (activeTab === "admins") return u.role === "admin";
                        return false;
                      }).length
                    }
                  </span>{" "}
                  {activeTab}
                </p>
                <div className="flex items-center gap-4">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2">
                    <Download size={16} />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <UserModal
            user={selectedUser}
            isOpen={showUserModal}
            onClose={() => {
              setShowUserModal(false);
              setSelectedUser(null);
            }}
            onSuspend={() => {
              setShowUserModal(false);
              setShowSuspendModal(true);
            }}
          />
          <SuspendModal />
        </>
      )}
    </div>
  );
}
