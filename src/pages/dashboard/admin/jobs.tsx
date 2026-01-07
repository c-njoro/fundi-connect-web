import { jobService, serviceService } from "@/lib/api/services";
import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  User,
  Wrench,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  TrendingUp,
  Package,
  ChevronDown,
  ChevronUp,
  X,
  Loader,
  FileText,
  MessageCircle,
  Phone,
  Mail,
  Shield,
  Award,
  Star,
  BriefcaseIcon,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Home,
  CreditCard,
  Users,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Zap,
  CalendarDays,
  Clock as ClockIcon,
  BarChart3,
} from "lucide-react";

interface Job {
  jobDetails: {
    title: string;
    description: string;
    images?: string[];
    urgency: "low" | "medium" | "high" | "urgent";
    estimatedBudget: {
      min: number;
      max?: number;
      currency: string;
    };
  };
  _id: string;
  customerId: {
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string | null;
      fullName: string;
      isVerified?: boolean;
    };
    _id: string;
    isFundi: boolean;
    isCustomer: boolean;
    id: string;
  };
  serviceId: {
    _id: string;
    name: string;
    category: string;
    icon?: string;
  };
  subService: string;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address?: string;
    county: string;
    city: string;
    area: string;
    landmark?: string;
  };
  scheduling: {
    preferredDate: string;
    preferredTime?: string;
    flexibility: "strict" | "flexible" | "negotiable";
  };
  status:
    | "posted"
    | "applied"
    | "pending_payment_escrow"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "disputed";
  payment: {
    method: string;
    status: string;
    escrowAmount: number;
    releaseDate?: string;
  };
  proposals: Array<{
    fundiId: string;
    proposedPrice: number;
    estimatedDuration: number;
    proposal: string;
    status: "pending" | "accepted" | "rejected";
    appliedAt: string;
  }>;
  workProgress?: Array<{
    updateBy: string;
    message?: string;
    images?: string[];
    stage: "started" | "in_progress" | "completed";
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  agreedPrice?: number;
  fundiId?: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
      fullName: string;
    };
    isFundi: boolean;
    isCustomer: boolean;
    id: string;
  };
  completion?: {
    completedAt: string;
    completionImages?: string[];
    customerApproved?: boolean;
    completionNotes?: string;
  };
}

interface Service {
  _id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  subServices?: Array<{
    name: string;
    description?: string;
    estimatedDuration: number;
    suggestedPrice: {
      min: number;
      max: number;
      currency: string;
    };
  }>;
}

// Status configuration
const statusConfig = {
  posted: {
    label: "Posted",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
    iconColor: "text-blue-500",
  },
  applied: {
    label: "Applied",
    color: "bg-purple-100 text-purple-800",
    icon: Users,
    iconColor: "text-purple-500",
  },
  pending_payment_escrow: {
    label: "Pending Payment",
    color: "bg-yellow-100 text-yellow-800",
    icon: CreditCard,
    iconColor: "text-yellow-500",
  },
  assigned: {
    label: "Assigned",
    color: "bg-yellow-100 text-yellow-800",
    icon: BriefcaseIcon,
    iconColor: "text-yellow-500",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-orange-100 text-orange-800",
    icon: TrendingUp,
    iconColor: "text-orange-500",
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  disputed: {
    label: "Disputed",
    color: "bg-pink-100 text-pink-800",
    icon: AlertTriangle,
    iconColor: "text-pink-500",
  },
};

// Urgency configuration
const urgencyConfig = {
  low: {
    label: "Low",
    color: "bg-green-100 text-green-800",
    icon: ClockIcon,
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    color: "bg-orange-100 text-orange-800",
    icon: AlertTriangle,
  },
  urgent: {
    label: "Urgent",
    color: "bg-red-100 text-red-800",
    icon: Zap,
  },
};

// Payment status configuration
const paymentStatusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  released: {
    label: "Released",
    color: "bg-blue-100 text-blue-800",
    icon: CreditCard,
  },
  refunded: {
    label: "Refunded",
    color: "bg-gray-100 text-gray-800",
    icon: DollarSign,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Filter states
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch jobs
  const fetchJobs = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await jobService.getAllJobs();
      console.log("Fetched Jobs:", data);
      if (data.success) {
        setJobs(data.data || []);
        setFilteredJobs(data.data || []);
      } else {
        setError(data.message || "Failed to load Jobs");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching Jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchServices();
  }, []);

  // Fetch services
  const fetchServices = async () => {
    setServicesError(null);
    setServicesLoading(true);
    try {
      const data = await serviceService.getAllServices();
      if (data.success) {
        setServices(data.data || []);
      } else {
        setServicesError(data.message || "Failed to load services");
      }
    } catch (err: any) {
      setServicesError(
        err.message || "An error occurred while fetching services"
      );
    } finally {
      setServicesLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...jobs];

    // Filter by service
    if (selectedService) {
      result = result.filter((job) => job.serviceId._id === selectedService);
    }

    // Filter by status
    if (selectedStatus) {
      result = result.filter((job) => job.status === selectedStatus);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((job) => new Date(job.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      result = result.filter((job) => new Date(job.createdAt) <= toDate);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (job) =>
          job.jobDetails.title.toLowerCase().includes(term) ||
          job.customerId.profile.fullName.toLowerCase().includes(term) ||
          job.serviceId.name.toLowerCase().includes(term) ||
          job.subService.toLowerCase().includes(term) ||
          job.location.city.toLowerCase().includes(term)
      );
    }

    setFilteredJobs(result);
  }, [selectedService, selectedStatus, dateFrom, dateTo, searchTerm, jobs]);

  const clearFilters = () => {
    setSelectedService("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "KES") => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const toggleRowExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedRows(newExpanded);
  };

  const getJobStats = () => {
    const total = jobs.length;
    const completed = jobs.filter((j) => j.status === "completed").length;
    const inProgress = jobs.filter((j) => j.status === "in_progress").length;
    const posted = jobs.filter((j) => j.status === "posted").length;
    const totalProposals = jobs.reduce(
      (sum, job) => sum + (job.proposals?.length || 0),
      0
    );
    const totalRevenue = jobs.reduce(
      (sum, job) => sum + (job.agreedPrice || 0),
      0
    );

    return {
      total,
      completed,
      inProgress,
      posted,
      totalProposals,
      totalRevenue,
    };
  };

  const stats = getJobStats();

  const JobModal = () => {
    if (!selectedJob || !showJobModal) return null;

    const job = selectedJob;
    const StatusIcon = statusConfig[job.status]?.icon || AlertCircle;
    const statusInfo = statusConfig[job.status] || statusConfig.posted;
    const urgencyInfo =
      urgencyConfig[job.jobDetails?.urgency] || urgencyConfig.low;
    const UrgencyIcon = urgencyInfo.icon;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${statusInfo.color}`}>
                <StatusIcon size={24} className={statusInfo.iconColor} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {job.jobDetails.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                  >
                    <StatusIcon size={14} className={statusInfo.iconColor} />
                    <span>{statusInfo.label}</span>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${urgencyInfo.color}`}
                  >
                    <UrgencyIcon size={14} />
                    <span>{urgencyInfo.label} Priority</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setShowJobModal(false);
                setSelectedJob(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Job Description */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4">
                    Job Description
                  </h4>
                  <p className="text-gray-900">{job.jobDetails.description}</p>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <User size={18} />
                    Customer Information
                  </h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white   text-xl">
                      {job.customerId.profile.firstName?.[0]}
                      {job.customerId.profile.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {job.customerId.profile.fullName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-900">
                          Customer ID: {job.customerId._id}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Account Type</p>
                      <div className="flex items-center gap-2">
                        {job.customerId.isCustomer && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <User size={10} />
                            Customer
                          </span>
                        )}
                        {job.customerId.isFundi && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Wrench size={10} />
                            Fundi
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profile Verified</p>
                      <span
                        className={`font-medium ${
                          job.customerId.profile.isVerified
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {job.customerId.profile.isVerified ? "Yes ✓" : "No ✗"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <Wrench size={18} />
                    Service Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="font-semibold text-gray-900">
                        {job.serviceId.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium text-gray-900">
                        {job.serviceId.category}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sub-service</p>
                      <p className="font-medium text-gray-900">
                        {job.subService}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proposals */}
                {job.proposals && job.proposals.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="  text-gray-900 text-lg mb-4">
                      Proposals ({job.proposals.length})
                    </h4>
                    <div className="space-y-4">
                      {job.proposals.map((proposal, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="  text-gray-900">
                              Fundi ID: {proposal.fundiId}
                            </span>
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                proposal.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : proposal.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {proposal.status.charAt(0).toUpperCase() +
                                proposal.status.slice(1)}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                            <div>
                              <p className="text-sm text-gray-600">
                                Proposed Price
                              </p>
                              <p className="font-semibold text-gray-900">
                                {formatCurrency(proposal.proposedPrice)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Estimated Duration
                              </p>
                              <p className="font-medium text-gray-900">
                                {proposal.estimatedDuration} hours
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Applied On
                              </p>
                              <p className="font-medium text-gray-900">
                                {formatDateTime(proposal.appliedAt)}
                              </p>
                            </div>
                          </div>
                          {proposal.proposal && (
                            <div>
                              <p className="text-sm text-gray-600">
                                Proposal Message
                              </p>
                              <p className="text-gray-900 mt-1">
                                {proposal.proposal}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Progress */}
                {job.workProgress && job.workProgress.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="  text-gray-900 text-lg mb-4">
                      Work Progress ({job.workProgress.length} updates)
                    </h4>
                    <div className="space-y-4">
                      {job.workProgress.map((progress, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-4 pb-4 relative"
                        >
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full" />
                          <div className="bg-white p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="  text-gray-900 capitalize">
                                {progress.stage.replace("_", " ")}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatDateTime(progress.timestamp)}
                              </span>
                            </div>
                            {progress.message && (
                              <p className="text-gray-900 mb-2">
                                {progress.message}
                              </p>
                            )}
                            {progress.images && progress.images.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {progress.images.map((img, imgIndex) => (
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
                            <div className="text-sm text-gray-600 mt-2">
                              Updated by: {progress.updateBy}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Details & Actions */}
              <div className="space-y-6">
                {/* Budget & Payment */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4">
                    Budget & Payment
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Estimated Budget</span>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(job.jobDetails.estimatedBudget.min)}
                          {job.jobDetails.estimatedBudget.max &&
                            ` - ${formatCurrency(
                              job.jobDetails.estimatedBudget.max
                            )}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {job.jobDetails.estimatedBudget.currency}
                        </div>
                      </div>
                    </div>
                    {job.agreedPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Agreed Price</span>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(job.agreedPrice)}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status</span>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          paymentStatusConfig[job.payment.status]?.color ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.payment.status.charAt(0).toUpperCase() +
                          job.payment.status.slice(1)}
                      </div>
                    </div>
                    {job.payment.escrowAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Escrow Amount</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(job.payment.escrowAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location & Scheduling */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <MapPin size={18} />
                    Location & Scheduling
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">
                        {job.location.address ||
                          `${job.location.area}, ${job.location.city}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.location.city}, {job.location.county}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preferred Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(job.scheduling.preferredDate)}
                      </p>
                    </div>
                    {job.scheduling.preferredTime && (
                      <div>
                        <p className="text-sm text-gray-600">Preferred Time</p>
                        <p className="font-medium text-gray-900">
                          {job.scheduling.preferredTime}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Flexibility</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {job.scheduling.flexibility}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Metadata */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4">Job Metadata</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Job ID</span>
                      <span className="font-mono text-sm text-gray-900">
                        {job._id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium text-gray-900">
                        {formatDateTime(job.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium text-gray-900">
                        {formatDateTime(job.updatedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Assigned Fundi</span>
                      <span className="font-medium text-gray-900">
                        {job.fundiId ? `${job.fundiId}` : "Not assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Completion Details */}
                {job.completion && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h4 className="  text-gray-900 text-lg mb-4">
                      Completion Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completed At</span>
                        <span className="font-medium text-gray-900">
                          {formatDateTime(job.completion.completedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Customer Approved</span>
                        <span
                          className={`font-medium ${
                            job.completion.customerApproved
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {job.completion.customerApproved ? "Yes ✓" : "No ✗"}
                        </span>
                      </div>
                      {job.completion.completionNotes && (
                        <div>
                          <p className="text-sm text-gray-600">
                            Completion Notes
                          </p>
                          <p className="text-gray-900 mt-1">
                            {job.completion.completionNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="  text-gray-900 text-lg mb-4">
                    Admin Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center gap-2">
                      <FileText size={14} />
                      <span>Generate Report</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
                      <Download size={14} />
                      <span>Download Details</span>
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2">
                      <ExternalLink size={14} />
                      <span>View Customer Profile</span>
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-900 text-lg">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg   text-gray-900 mb-2">Error Loading Jobs</h3>
          <p className="text-gray-900 mb-4">{error}</p>
          <button
            onClick={fetchJobs}
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
                Job Management
              </h1>
              <p className="text-gray-600">View and manage all platform jobs</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                />
              </div>
              <button
                onClick={fetchJobs}
                className="bg-[#0A2647] text-white px-4 py-2 rounded-lg hover:bg-[#0d3157] transition-colors   flex items-center gap-2"
              >
                <Clock size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.completed}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Posted</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.posted}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Proposals</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalProposals}
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ThumbsUp className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    KSh {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </div> */}

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="  text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                >
                  <option value="">All Services</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={48} className="text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No Jobs Found
            </h3>
            <p className="text-gray-700 max-w-md mx-auto mb-6">
              {searchTerm ||
              selectedService ||
              selectedStatus ||
              dateFrom ||
              dateTo
                ? "No jobs match your current filters. Try adjusting your search criteria."
                : "There are no jobs available at the moment."}
            </p>
            {(searchTerm ||
              selectedService ||
              selectedStatus ||
              dateFrom ||
              dateTo) && (
              <button
                onClick={clearFilters}
                className="bg-[#0A2647] text-white px-6 py-3 rounded-lg hover:bg-[#0d3157] transition-colors  "
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Job Details
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Customer
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Budget & Proposals
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Status
                    </th>
                    <th className="py-4 px-6 text-left text-sm   text-gray-900">
                      Created
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
                  {filteredJobs.map((job) => {
                    const StatusIcon =
                      statusConfig[job.status]?.icon || AlertCircle;
                    const statusInfo =
                      statusConfig[job.status] || statusConfig.posted;
                    const urgencyInfo =
                      urgencyConfig[job.jobDetails.urgency] ||
                      urgencyConfig.low;
                    const isExpanded = expandedRows.has(job._id);

                    return (
                      <>
                        <tr key={job._id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div>
                              <p className="  text-gray-900">
                                {job.jobDetails.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Wrench size={12} className="text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {job.serviceId.name} • {job.subService}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin size={12} className="text-gray-400" />
                                <span className="text-sm text-gray-700">
                                  {job.location.city}, {job.location.area}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white text-sm  ">
                                {job.customerId.profile.firstName?.[0]}
                                {job.customerId.profile.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-gray-900">
                                  {job.customerId.profile.fullName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ID: {job.customerId._id.slice(-6)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <DollarSign
                                  size={14}
                                  className="text-green-500"
                                />
                                <span className="text-gray-900">
                                  {formatCurrency(
                                    job.jobDetails.estimatedBudget.min
                                  )}
                                  {job.jobDetails.estimatedBudget.max &&
                                    `-${formatCurrency(
                                      job.jobDetails.estimatedBudget.max
                                    )}`}
                                </span>
                              </div>
                              {job.agreedPrice && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle
                                    size={14}
                                    className="text-green-500"
                                  />
                                  <span className="text-green-600 font-medium">
                                    Agreed: {formatCurrency(job.agreedPrice)}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-blue-500" />
                                <span className="text-gray-900">
                                  {job.proposals.length} proposal
                                  {job.proposals.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <div
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                              >
                                <StatusIcon
                                  size={14}
                                  className={statusInfo.iconColor}
                                />
                                <span>{statusInfo.label}</span>
                              </div>
                              <div
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${urgencyInfo.color}`}
                              >
                                <urgencyInfo.icon size={12} />
                                <span>{urgencyInfo.label}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <span className="text-gray-900">
                                {formatDate(job.createdAt)}
                              </span>
                              <div className="text-sm text-gray-700">
                                {Math.floor(
                                  (new Date().getTime() -
                                    new Date(job.createdAt).getTime()) /
                                    (1000 * 3600 * 24)
                                )}{" "}
                                days ago
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setShowJobModal(true);
                              }}
                              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2 text-sm"
                            >
                              <Eye size={14} />
                              <span>View Details</span>
                            </button>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => toggleRowExpansion(job._id)}
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
                                    Quick Info
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Service
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {job.serviceId.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Sub-service
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {job.subService}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Proposals
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {job.proposals.length}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="  text-gray-900 mb-2">
                                    Scheduling
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Preferred Date
                                      </span>
                                      <span className="font-medium text-gray-900">
                                        {formatDate(
                                          job.scheduling.preferredDate
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-700">
                                        Flexibility
                                      </span>
                                      <span className="font-medium text-gray-900 capitalize">
                                        {job.scheduling.flexibility}
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
                                        setSelectedJob(job);
                                        setShowJobModal(true);
                                      }}
                                      className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                    >
                                      View Full Details
                                    </button>
                                    <button className="w-full text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                                      Message Customer
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
                  <span className="  text-gray-900">{filteredJobs.length}</span>{" "}
                  of <span className="  text-gray-900">{jobs.length}</span> jobs
                </p>
                <div className="flex items-center gap-4">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center gap-2">
                    <Download size={16} />
                    <span>Export Jobs</span>
                  </button>
                  <button className="bg-[#0A2647] text-white px-4 py-2 rounded-lg hover:bg-[#0d3157] transition-colors  ">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Modal */}
      <JobModal />
    </div>
  );
}
