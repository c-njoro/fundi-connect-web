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
  BriefcaseIcon,
  FileCheck,
  FileX,
  CalendarDays,
  CheckSquare,
  XSquare,
  DownloadCloud,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock4,
} from "lucide-react";

interface IFundi {
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string | null;
    gender?: string | null;
    languages?: string[];
    isVerified: boolean;
    verificationDocuments?: any[];
    dateOfBirth?: string;
    fullName: string;
  };
  location: {
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
    county: string;
    city: string;
    area: string;
  };
  fundiProfile: {
    availability: {
      schedule: Record<string, any>;
      currentStatus: string;
      lastUpdated: string;
    };
    ratings: {
      average: number;
      totalReviews: number;
    };
    bankDetails?: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      mpesaNumber: string;
    };
    services: string[];
    experience: number;
    bio: string;
    portfolio: Array<{
      title: string;
      description: string;
      images: string[];
      completedDate: string;
    }>;
    pricing: Array<{
      serviceId: string;
      rateType: string;
      minRate: number;
      maxRate: number;
      currency: string;
    }>;
    certifications: Array<{
      name: string;
      issuedBy: string;
      dateIssued: string;
      expiryDate: string;
      certificateUrl: string;
      verified: boolean;
    }>;
    profileStatus: string;
    applicationDate: string;
    approvedDate?: string;
    cancelledJobs: number;
    completedJobs: number;
    suspensionReason?: string;
  };
  _id: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  isFundi: boolean;
  isCustomer: boolean;
  id: string;
}

export default function PendingFundis() {
  const [pendingFundis, setPendingFundis] = useState<IFundi[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [suspendReason, setSuspendReason] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updatingError, setUpdatingError] = useState<string | null>(null);
  const [selectedFundi, setSelectedFundi] = useState<IFundi | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchPendingFundis = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await userService.getPendingApprovals();
      console.log("Fetched pending-fundis:", data);
      if (data.success) {
        setPendingFundis(data.data || []);
        return;
      }
      setError(data.message || "Failed to load pending-fundis");
    } catch (err: any) {
      setError(
        err.message || "An error occurred while fetching pending-fundis"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFundis();
  }, []);

  const handleUpdateFundi = async (userId: string) => {
    setUpdatingError(null);
    setUpdatingStatus(true);

    if (!selectedStatus) {
      setUpdatingError("Please select a status before updating.");
      return;
    }

    const status = selectedStatus;
    let reason = suspendReason;

    if (!suspendReason.trim() && status !== "approved") {
      setUpdatingError("Please provide a reason for not approving the fundi.");
      return;
    }

    try {
      const response = await userService.updateFundiStatus(
        userId,
        status,
        reason
      );
      if (response.success) {
        console.log("Fundi updated successfully");
        // Refresh the user list to reflect changes
        fetchPendingFundis();
        setSuspendReason("");
        setShowDetailModal(false);
        setShowConfirmModal(false);
        setSelectedFundi(null);
      } else {
        setUpdatingError(response.message || "Failed to update fundi");
      }
    } catch (err: any) {
      setUpdatingError(err.message || "An error occurred while updating fundi");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleApprove = (fundi: IFundi) => {
    setSelectedFundi(fundi);
    setSelectedStatus("approved");
    setShowConfirmModal(true);
  };

  const handleReject = (fundi: IFundi) => {
    setSelectedFundi(fundi);
    setSelectedStatus("rejected");
    setSuspendReason("");
    setUpdatingError(null);
    setShowConfirmModal(true);
  };

  const filteredFundis = pendingFundis.filter((fundi) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      fundi.profile?.fullName?.toLowerCase().includes(term) ||
      fundi.email?.toLowerCase().includes(term) ||
      fundi.phone?.toLowerCase().includes(term) ||
      fundi.location?.city?.toLowerCase().includes(term) ||
      fundi.location?.area?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleRowExpansion = (fundiId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(fundiId)) {
      newExpanded.delete(fundiId);
    } else {
      newExpanded.add(fundiId);
    }
    setExpandedRows(newExpanded);
  };

  const getServiceCountText = (fundi: IFundi) => {
    const count = fundi.fundiProfile?.services?.length || 0;
    return `${count} service${count !== 1 ? "s" : ""}`;
  };

  const getExperienceText = (fundi: IFundi) => {
    const exp = fundi.fundiProfile?.experience || 0;
    return `${exp} year${exp !== 1 ? "s" : ""}`;
  };

  const DetailModal = () => {
    if (!selectedFundi || !showDetailModal) return null;

    const fundi = selectedFundi;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white   text-xl">
                {fundi.profile?.firstName?.[0]}
                {fundi.profile?.lastName?.[0]}
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {fundi.profile?.fullName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Clock size={14} />
                    <span>Pending Review</span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Wrench size={14} />
                    <span>Fundi</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedFundi(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <User size={18} />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {fundi.profile?.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {fundi.profile?.gender || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Languages</p>
                      <p className="font-medium text-gray-900">
                        {fundi.profile?.languages?.join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <Phone size={18} />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {fundi.email}
                        </p>
                        {fundi.emailVerified && (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {fundi.phone}
                        </p>
                        {fundi.phoneVerified && (
                          <CheckCircle size={14} className="text-green-500" />
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <p className="font-medium text-gray-900">
                          {fundi.location?.area}, {fundi.location?.city},{" "}
                          {fundi.location?.county}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <BriefcaseIcon size={18} />
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {getExperienceText(fundi)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Services Offered</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {getServiceCountText(fundi)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Application Date</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {formatDate(fundi.fundiProfile?.applicationDate)}
                      </p>
                    </div>
                  </div>

                  {fundi.fundiProfile?.bio && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">
                        Bio/Description
                      </p>
                      <p className="text-gray-900 bg-white p-4 rounded-lg border border-gray-200">
                        {fundi.fundiProfile.bio}
                      </p>
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                {fundi.fundiProfile?.portfolio &&
                  fundi.fundiProfile.portfolio.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="  text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <ImageIcon size={18} />
                        Portfolio ({fundi.fundiProfile.portfolio.length}{" "}
                        projects)
                      </h4>
                      <div className="space-y-4">
                        {fundi.fundiProfile.portfolio.map((project, index) => (
                          <div
                            key={index}
                            className="bg-white p-4 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="  text-gray-900">
                                {project.title}
                              </h5>
                              <span className="text-sm text-gray-600">
                                {formatDate(project.completedDate)}
                              </span>
                            </div>
                            <p className="text-gray-900 mb-3">
                              {project.description}
                            </p>
                            {project.images && project.images.length > 0 && (
                              <div className="flex gap-2">
                                {project.images.map((img, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"
                                  >
                                    <ImageIcon
                                      size={20}
                                      className="text-gray-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Certifications */}
                {fundi.fundiProfile?.certifications &&
                  fundi.fundiProfile.certifications.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="  text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <Award size={18} />
                        Certifications (
                        {fundi.fundiProfile.certifications.length})
                      </h4>
                      <div className="space-y-3">
                        {fundi.fundiProfile.certifications.map(
                          (cert, index) => (
                            <div
                              key={index}
                              className="bg-white p-4 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="  text-gray-900">{cert.name}</h5>
                                <div className="flex items-center gap-1">
                                  {cert.verified ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <CheckCircle size={10} />
                                      Verified
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <Clock size={10} />
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600">Issued By</p>
                                  <p className="font-medium text-gray-900">
                                    {cert.issuedBy}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Date Issued</p>
                                  <p className="font-medium text-gray-900">
                                    {formatDate(cert.dateIssued)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Expiry Date</p>
                                  <p className="font-medium text-gray-900">
                                    {formatDate(cert.expiryDate)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Right Column - Actions & Summary */}
              <div className="space-y-6">
                {/* Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="  text-gray-900 text-lg mb-4">
                    Review Actions
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleApprove(fundi)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors   flex items-center justify-center gap-2"
                    >
                      <ThumbsUp size={18} />
                      <span>Approve Application</span>
                    </button>
                    <button
                      onClick={() => handleReject(fundi)}
                      className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors   flex items-center justify-center gap-2"
                    >
                      <ThumbsDown size={18} />
                      <span>Reject Application</span>
                    </button>
                  </div>
                </div>

                {/* Account Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="  text-gray-900 text-lg mb-4">
                    Account Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(fundi.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Login</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(fundi.lastLogin)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Status</span>
                      <span
                        className={`font-medium ${
                          fundi.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {fundi.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="  text-gray-900 text-lg mb-4">
                    Verification Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email Verified</span>
                      {fundi.emailVerified ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Phone Verified</span>
                      {fundi.phoneVerified ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Profile Verified</span>
                      {fundi.profile?.isVerified ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h4 className="  text-gray-900 text-lg mb-4">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2">
                      <DownloadCloud size={14} />
                      <span>Download Documents</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
                      <MessageSquare size={14} />
                      <span>Contact Fundi</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
                      <ExternalLink size={14} />
                      <span>View Full Profile</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmModal = () => {
    if (!selectedFundi || !showConfirmModal) return null;

    const isReject = selectedStatus === "rejected";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {isReject ? "Reject Application" : "Approve Application"}
              </h3>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedStatus("");
                  setUpdatingError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white  ">
                  {selectedFundi.profile?.firstName?.[0]}
                  {selectedFundi.profile?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedFundi.profile?.fullName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedFundi.email}</p>
                  <p className="text-sm text-gray-600">{selectedFundi.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {isReject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => {
                      setSuspendReason(e.target.value);
                      if (updatingError) setUpdatingError(null);
                    }}
                    placeholder="Please provide a detailed reason for rejecting this application..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                    rows={4}
                  />
                  {updatingError && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {updatingError}
                    </p>
                  )}
                </div>
              )}

              {!isReject && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CheckCircle size={16} />
                    <span className=" ">
                      Are you sure you want to approve this application?
                    </span>
                  </div>
                  <p className="text-green-600 text-sm">
                    This will grant the fundi full access to the platform and
                    allow them to start receiving job requests.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedStatus("");
                    setUpdatingError(null);
                    if (isReject) setSuspendReason("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors  "
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateFundi(selectedFundi._id)}
                  disabled={
                    updatingStatus || (isReject && !suspendReason.trim())
                  }
                  className={`flex-1 py-3 rounded-lg transition-colors   flex items-center justify-center gap-2 ${
                    isReject
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {updatingStatus ? (
                    <>
                      <Loader className="animate-spin h-4 w-4" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {isReject ? (
                        <XSquare size={16} />
                      ) : (
                        <CheckSquare size={16} />
                      )}
                      <span>
                        {isReject ? "Confirm Reject" : "Confirm Approve"}
                      </span>
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
          <p className="text-gray-900 text-lg">
            Loading pending applications...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg   text-gray-900 mb-2">
            Error Loading Applications
          </h3>
          <p className="text-gray-900 mb-4">{error}</p>
          <button
            onClick={fetchPendingFundis}
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
                Pending Fundi Applications
              </h1>
              <p className="text-gray-600">
                Review and approve fundi applications
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
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                />
              </div>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2">
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <button
                onClick={fetchPendingFundis}
                className="bg-[#0A2647] text-white px-4 py-2 rounded-lg hover:bg-[#0d3157] transition-colors   flex items-center gap-2"
              >
                <Clock4 size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {pendingFundis.length}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      pendingFundis.filter((f) => {
                        const appDate = new Date(
                          f.fundiProfile?.applicationDate
                        );
                        const now = new Date();
                        return (
                          appDate.getMonth() === now.getMonth() &&
                          appDate.getFullYear() === now.getFullYear()
                        );
                      }).length
                    }
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Experience</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {pendingFundis.length > 0
                      ? Math.round(
                          pendingFundis.reduce(
                            (sum, f) => sum + (f.fundiProfile?.experience || 0),
                            0
                          ) / pendingFundis.length
                        )
                      : 0}{" "}
                    yrs
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BriefcaseIcon className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Portfolio</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {
                      pendingFundis.filter(
                        (f) => f.fundiProfile?.portfolio?.length > 0
                      ).length
                    }
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ImageIcon className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredFundis.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              All Applications Processed
            </h3>
            <p className="text-gray-700 max-w-md mx-auto mb-6">
              There are no pending fundi applications at the moment. All
              applications have been reviewed and processed.
            </p>
            <button
              onClick={fetchPendingFundis}
              className="bg-[#0A2647] text-white px-6 py-3 rounded-lg hover:bg-[#0d3157] transition-colors   flex items-center gap-2 mx-auto"
            >
              <Clock4 size={16} />
              <span>Check for New Applications</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Applicant
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Contact
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Experience & Services
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Applied On
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
                  {filteredFundis.map((fundi) => {
                    const isExpanded = expandedRows.has(fundi._id);

                    return (
                      <>
                        <tr key={fundi._id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white  ">
                                {fundi.profile?.firstName?.[0]}
                                {fundi.profile?.lastName?.[0]}
                              </div>
                              <div>
                                <p className="  text-gray-900">
                                  {fundi.profile?.fullName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                                    <Clock size={10} />
                                    Pending
                                  </span>
                                  {fundi.profile?.isVerified && (
                                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                      <Shield size={10} />
                                      Verified
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
                                  {fundi.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-gray-900">
                                  {fundi.phone}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700">
                                {fundi.location?.city}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <BriefcaseIcon
                                  size={14}
                                  className="text-blue-500"
                                />
                                <span className="text-gray-900">
                                  {getExperienceText(fundi)} experience
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Wrench size={14} className="text-green-500" />
                                <span className="text-gray-900">
                                  {getServiceCountText(fundi)}
                                </span>
                              </div>
                              {fundi.fundiProfile?.portfolio?.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <ImageIcon
                                    size={14}
                                    className="text-purple-500"
                                  />
                                  <span className="text-gray-900">
                                    {fundi.fundiProfile.portfolio.length}{" "}
                                    portfolio item
                                    {fundi.fundiProfile.portfolio.length !== 1
                                      ? "s"
                                      : ""}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <span className="text-gray-900">
                                {formatDate(
                                  fundi.fundiProfile?.applicationDate
                                )}
                              </span>
                              <div className="text-sm text-gray-700">
                                {Math.floor(
                                  (new Date().getTime() -
                                    new Date(
                                      fundi.fundiProfile?.applicationDate
                                    ).getTime()) /
                                    (1000 * 3600 * 24)
                                )}{" "}
                                days ago
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedFundi(fundi);
                                  setShowDetailModal(true);
                                }}
                                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2 text-sm"
                              >
                                <Eye size={14} />
                                <span>Review</span>
                              </button>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleApprove(fundi)}
                                  className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors text-sm   flex items-center gap-1"
                                >
                                  <ThumbsUp size={12} />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleReject(fundi)}
                                  className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors text-sm   flex items-center gap-1"
                                >
                                  <ThumbsDown size={12} />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => toggleRowExpansion(fundi._id)}
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
                            <td colSpan={6} className="bg-gray-50 px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                  <h4 className="  text-gray-900 mb-2">
                                    Verification Status
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Email Verified
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          fundi.emailVerified
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {fundi.emailVerified ? "Yes ✓" : "No ✗"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Phone Verified
                                      </span>
                                      <span
                                        className={`font-medium ${
                                          fundi.phoneVerified
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {fundi.phoneVerified ? "Yes ✓" : "No ✗"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="  text-gray-900 mb-2">
                                    Certifications
                                  </h4>
                                  <div className="space-y-1">
                                    <span className="text-gray-900">
                                      {fundi.fundiProfile?.certifications
                                        ?.length || 0}{" "}
                                      certification
                                      {fundi.fundiProfile?.certifications
                                        ?.length !== 1
                                        ? "s"
                                        : ""}
                                    </span>
                                    {fundi.fundiProfile?.certifications?.map(
                                      (cert, index) => (
                                        <div
                                          key={index}
                                          className="text-sm text-gray-700 flex items-center gap-1"
                                        >
                                          <Award size={12} />
                                          <span>{cert.name}</span>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="  text-gray-900 mb-2">
                                    Quick Actions
                                  </h4>
                                  <div className="space-y-2">
                                    <button
                                      onClick={() => {
                                        setSelectedFundi(fundi);
                                        setShowDetailModal(true);
                                      }}
                                      className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                    >
                                      View Full Details
                                    </button>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleApprove(fundi)}
                                        className="flex-1 text-left px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                                      >
                                        Quick Approve
                                      </button>
                                      <button
                                        onClick={() => handleReject(fundi)}
                                        className="flex-1 text-left px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                      >
                                        Quick Reject
                                      </button>
                                    </div>
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
                    {filteredFundis.length}
                  </span>{" "}
                  of{" "}
                  <span className="  text-gray-900">
                    {pendingFundis.length}
                  </span>{" "}
                  pending applications
                </p>
                <div className="flex items-center gap-4">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2">
                    <Download size={16} />
                    <span>Export List</span>
                  </button>
                  <button className="bg-[#0A2647] text-white px-4 py-2 rounded-lg hover:bg-[#0d3157] transition-colors  ">
                    Batch Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <DetailModal />
      <ConfirmModal />
    </div>
  );
}
