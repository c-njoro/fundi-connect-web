import { useAuth } from "@/contexts/AuthContext";
import { jobService } from "@/lib/api/services";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Wrench,
  User,
  Calendar,
  MapPin,
  MessageCircle,
  Phone,
  ChevronRight,
  Plus,
  Search,
  AlertCircle,
  Loader,
  XCircle,
  Eye,
  ThumbsUp,
  Award,
  FileText,
  Users,
  Briefcase,
  Home,
  MessageSquare,
  ShoppingBag,
  Zap,
  Star,
  ArrowRight,
  Filter,
  MoreVertical,
  Download,
  ExternalLink,
  Wallet,
  Target,
  Percent,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";

interface IJob {
  _id: string;
  status: "posted" | "completed" | "in_progress";
  subService: string;
  agreedPrice?: number;

  jobDetails: {
    title: string;
    description: string;
    images: string[];
    urgency: "low" | "medium" | "high";
    estimatedBudget: {
      min: number;
      max: number;
      currency: string;
    };
  };

  serviceId: {
    _id: string;
    name: string;
    category: string;
    icon: string;
  };

  customerId: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      fullName: string;
      avatar: string | null;
    };
  };

  fundiId?: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
      fullName: string;
      avatar: string;
    };
    fundiProfile: {
      ratings: {
        average: number;
        totalReviews: number;
      };
    };
  };

  location: {
    address: string;
    county: string;
    city: string;
    area: string;
    landmark: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };

  scheduling: {
    preferredDate: string;
    preferredTime: string;
    flexibility: "strict" | "flexible";
  };

  payment: {
    method: "cash" | "mpesa";
    status: "pending" | "released";
    escrowAmount: number;
    releaseDate?: string;
  };

  proposals: {
    fundiId: string;
    proposedPrice: number;
    estimatedDuration: number;
    proposal: string;
    status: "pending" | "accepted" | "rejected";
    appliedAt: string;
  }[];

  workProgress: {
    updateBy: string;
    message?: string;
    images: string[];
    stage: "started" | "in_progress" | "completed";
    timestamp: string;
  }[];

  completion?: {
    completedAt: string;
    completionImages: string[];
    customerApproved: boolean;
    completionNotes: string;
  };

  createdAt: string;
  updatedAt: string;
}

interface IProposal {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  jobStatus: string;
  service: {
    _id: string;
    name: string;
    category: string;
    icon: string;
  };
  customer: {
    profile: {
      firstName: string;
      lastName: string;
      avatar: string | null;
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
    _id: string;
    isFundi: boolean;
    isCustomer: boolean;
    id: string;
  };
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
    county: string;
    city: string;
    area: string;
    landmark: string;
  };
  estimatedBudget: {
    min: number;
    max: number;
    currency: string;
  };
  urgency: string;
  scheduling: {
    preferredDate: string;
    preferredTime: string;
    flexibility: string;
  };
  proposal: {
    proposedPrice: number;
    estimatedDuration: number;
    proposal: string;
    status: "pending" | "accepted" | "rejected";
    appliedAt: string;
  };
  agreedPrice?: number;
  createdAt: string;
}

interface IProposalStats {
  totalProposals: number;
  pending: number;
  accepted: number;
  rejected: number;
  successRate: number;
}

// Status configuration
const statusConfig = {
  posted: {
    label: "Posted",
    color: "bg-blue-100 text-blue-800",
    icon: FileText,
    iconColor: "text-blue-500",
  },
  applied: {
    label: "Applied",
    color: "bg-purple-100 text-purple-800",
    icon: Users,
    iconColor: "text-purple-500",
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
  rejected: {
    label: "Rejected",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
    iconColor: "text-gray-500",
  },
};

// Proposal status configuration
const proposalStatusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    iconColor: "text-yellow-500",
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    iconColor: "text-red-500",
  },
};

// Urgency configuration
const urgencyConfig = {
  low: { label: "Low", color: "bg-green-100 text-green-800", icon: Clock },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    color: "bg-orange-100 text-orange-800",
    icon: Zap,
  },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800", icon: Zap },
};

export default function FundiDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    totalEarned: 0,
    pendingPayments: 0,
    successRate: 0,
  });
  const [proposals, setProposals] = useState<IProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [proposalsError, setProposalsError] = useState<string | null>(null);
  const [proposalStats, setProposalStats] = useState<IProposalStats>({
    totalProposals: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    successRate: 0,
  });
  const [proposalStatsLoading, setProposalStatsLoading] = useState(true);
  const [proposalStatsError, setProposalStatsError] = useState<string | null>(
    null
  );

  // Fetch jobs where fundi is assigned (fundiId matches user._id)
  const fetchAssignedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getMyJobs();
      if (data.success) {
        const jobsData = data.data || [];
        // Filter jobs where the fundi is assigned (fundiId exists and matches user._id)
        const assignedJobs = jobsData.filter(
          (job: IJob) => job.fundiId && job.fundiId._id === user?._id
        );
        setJobs(assignedJobs);

        // Calculate stats for assigned jobs
        let active = 0;
        let completed = 0;
        let totalEarned = 0;
        let pendingPayments = 0;

        assignedJobs.forEach((job: IJob) => {
          if (job.status === "in_progress") {
            active++;
            // Count pending payments for in-progress jobs
            if (job.payment.status === "pending") {
              pendingPayments += job.agreedPrice || 0;
            }
          }
          if (job.status === "completed") {
            completed++;
            // Calculate total earned from completed jobs
            if (job.agreedPrice) {
              totalEarned += job.agreedPrice;
            }
          }
        });

        // Calculate success rate (completed jobs / total assigned jobs * 100)
        const successRate =
          assignedJobs.length > 0
            ? Math.round((completed / assignedJobs.length) * 100)
            : 0;

        setStats({
          active,
          completed,
          totalEarned,
          pendingPayments,
          successRate,
        });
      } else {
        setError(data.message || "Failed to load jobs");
      }
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err.message || "An error occurred while fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    setProposalsLoading(true);
    setProposalsError(null);
    try {
      const data = await jobService.getMyProposals();
      if (data.success) {
        setProposals(data.data || []);
      } else {
        setProposalsError(data.message || "Failed to load proposals");
      }
    } catch (err: any) {
      console.error("Error fetching proposals:", err);
      setProposalsError(
        err.message || "An error occurred while fetching proposals"
      );
    } finally {
      setProposalsLoading(false);
    }
  };

  const fetchProposalsStats = async () => {
    setProposalStatsLoading(true);
    setProposalStatsError(null);
    try {
      const data = await jobService.getMyProposalStats();
      if (data.success) {
        setProposalStats(data.data || {});
      } else {
        setProposalStatsError(data.message || "Failed to load proposal stats");
      }
    } catch (error) {
      console.error("Error fetching proposal stats:", error);
      setProposalStatsError("An error occurred while fetching proposal stats");
    } finally {
      setProposalStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAssignedJobs();
      fetchProposals();
      fetchProposalsStats();
    }
  }, [user?._id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRecentAssignedJobs = () => {
    return [...jobs]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  };

  const getActiveJobs = () => {
    return jobs.filter((job) => job.status === "in_progress");
  };

  const getPendingProposals = () => {
    return proposals.filter(
      (proposal) => proposal.proposal.status === "pending"
    );
  };

  const getAcceptedProposals = () => {
    return proposals.filter(
      (proposal) => proposal.proposal.status === "accepted"
    );
  };

  const getPendingActions = () => {
    const actions: any = [];

    // Jobs that need progress updates (in_progress without recent updates)
    jobs.forEach((job) => {
      if (job.status === "in_progress") {
        const hasRecentUpdate = job.workProgress?.some((progress) => {
          const updateDate = new Date(progress.timestamp);
          const now = new Date();
          const hoursSinceUpdate =
            (now.getTime() - updateDate.getTime()) / (1000 * 3600);
          return hoursSinceUpdate < 24;
        });

        if (!hasRecentUpdate) {
          actions.push({
            type: "progress_update",
            jobId: job._id,
            jobTitle: job.jobDetails.title,
            message: `Update progress for "${job.jobDetails.title}"`,
          });
        }
      }

      // Jobs that are completed but need customer approval
      if (
        job.status === "completed" &&
        job.completion &&
        !job.completion.customerApproved
      ) {
        actions.push({
          type: "customer_approval",
          jobId: job._id,
          jobTitle: job.jobDetails.title,
          message: `Awaiting customer approval for "${job.jobDetails.title}"`,
        });
      }

      // Pending payments
      if (job.status === "in_progress" && job.payment.status === "pending") {
        actions.push({
          type: "payment",
          jobId: job._id,
          jobTitle: job.jobDetails.title,
          message: `Payment pending for "${job.jobDetails.title}"`,
          amount: job.agreedPrice,
        });
      }
    });

    return actions.slice(0, 3);
  };

  if (loading || proposalsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-900 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-900 mb-4">{error}</p>
          <button
            onClick={fetchAssignedJobs}
            className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors font-semibold"
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
              <h1 className="text-2xl font-bold text-gray-900">
                Fundi Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back! Manage your jobs and proposals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2">
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <button
                onClick={() => {
                  fetchAssignedJobs();
                  fetchProposals();
                  fetchProposalsStats();
                }}
                className="bg-[#0A2647] text-white px-4 py-2 rounded-lg hover:bg-[#0d3157] transition-colors font-semibold flex items-center gap-2"
              >
                <Clock size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* A. Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Active Jobs */}
            <div className="bg-gradient-to-br from-[#0A2647] to-[#1e3a5f] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Jobs</p>
                  <p className="text-3xl font-bold mt-2">{stats.active}</p>
                  <p className="text-sm opacity-90 mt-1">Currently working</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Completed Jobs */}
            <div className="bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Completed Jobs</p>
                  <p className="text-3xl font-bold mt-2">{stats.completed}</p>
                  <p className="text-sm opacity-90 mt-1">
                    Successfully delivered
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>

            {/* Total Earned */}
            <div className="bg-gradient-to-br from-[#6A1B9A] to-[#9C27B0] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Earned</p>
                  <p className="text-3xl font-bold mt-2">
                    KSh {stats.totalEarned.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-90 mt-1">From completed jobs</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#ff8a65] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Success Rate</p>
                  <p className="text-3xl font-bold mt-2">
                    {stats.successRate}%
                  </p>
                  <p className="text-sm opacity-90 mt-1">Job completion rate</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Target size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Stats */}
          {!proposalStatsLoading && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Proposal Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Proposals</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {proposalStats.totalProposals}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {proposalStats.pending}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accepted</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {proposalStats.accepted}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Percent className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {proposalStats.successRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* B. Recent Assigned Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Assigned Jobs
                </h2>
                <Link
                  href="/dashboard/fundi/jobs"
                  className="text-[#0A2647] hover:text-[#0d3157] font-semibold flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              {getRecentAssignedJobs().length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Assigned Jobs Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You haven't been assigned any jobs yet
                  </p>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#ff5722] transition-colors font-semibold"
                  >
                    <Search size={16} />
                    <span>Browse Available Jobs</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {getRecentAssignedJobs().map((job) => {
                    const StatusIcon =
                      statusConfig[job.status]?.icon || AlertCircle;
                    const statusInfo =
                      statusConfig[job.status] || statusConfig.posted;

                    return (
                      <div
                        key={job._id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-[#FF6B35] transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                              >
                                <StatusIcon
                                  size={14}
                                  className={statusInfo.iconColor}
                                />
                                <span>{statusInfo.label}</span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {formatDate(job.createdAt)}
                              </span>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-2">
                              {job.jobDetails.title}
                            </h4>

                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Wrench size={14} />
                                <span>{job.serviceId.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} />
                                <span>{job.location.city}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User size={14} />
                                <span>{job.customerId.profile.fullName}</span>
                              </div>
                              {job.agreedPrice && (
                                <div className="flex items-center gap-1">
                                  <DollarSign size={14} />
                                  <span>
                                    KSh {job.agreedPrice.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Urgency badge */}
                            <div className="mb-3">
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  urgencyConfig[job.jobDetails.urgency]?.color
                                }`}
                              >
                                <Zap size={12} />
                                <span>
                                  {urgencyConfig[job.jobDetails.urgency]?.label}{" "}
                                  Urgency
                                </span>
                              </div>
                            </div>

                            {/* Progress updates count */}
                            {job.workProgress &&
                              job.workProgress.length > 0 && (
                                <div className="mb-3">
                                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    <TrendingUp size={12} />
                                    <span>
                                      {job.workProgress.length} progress update
                                      {job.workProgress.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Link
                              href={`/dashboard/fundi/jobs/${job._id}`}
                              className="text-[#0A2647] hover:text-[#0d3157] font-medium text-sm flex items-center gap-1"
                            >
                              <Eye size={14} />
                              <span>View Job</span>
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1">
                              <MessageCircle size={14} />
                              <span>Message Customer</span>
                            </button>
                            {job.status === "in_progress" && (
                              <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                                <CheckSquare size={14} />
                                <span>Update Progress</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* C. Active Jobs Section */}
            {getActiveJobs().length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Active Jobs
                </h2>

                <div className="space-y-6">
                  {getActiveJobs().map((job) => (
                    <div
                      key={job._id}
                      className="border border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {job.jobDetails.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{job.customerId.profile.fullName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{job.location.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign size={14} />
                              <span>
                                KSh{" "}
                                {job.agreedPrice?.toLocaleString() ||
                                  "Negotiable"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-medium text-gray-900 text-sm">
                              Deadline
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(job.scheduling.preferredDate)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Updates */}
                      {job.workProgress && job.workProgress.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Recent Progress
                          </h4>
                          <div className="space-y-3">
                            {job.workProgress
                              .slice(-2)
                              .map((progress, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-4"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900 capitalize">
                                      {progress.stage.replace("_", " ")}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {formatDateTime(progress.timestamp)}
                                    </span>
                                  </div>
                                  {progress.message && (
                                    <p className="text-gray-700">
                                      {progress.message}
                                    </p>
                                  )}
                                  {progress.images &&
                                    progress.images.length > 0 && (
                                      <div className="flex gap-2 mt-2">
                                        {progress.images.map(
                                          (img, imgIndex) => (
                                            <div
                                              key={imgIndex}
                                              className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"
                                            >
                                              <FileText
                                                size={16}
                                                className="text-gray-500"
                                              />
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Link
                          href={`/dashboard/fundi/jobs/${job._id}/progress`}
                          className="flex-1 bg-[#0A2647] text-white py-2 rounded-lg hover:bg-[#0d3157] transition-colors font-semibold text-center"
                        >
                          Update Progress
                        </Link>
                        <Link
                          href={`/dashboard/messages?user=${job.customerId._id}`}
                          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2"
                        >
                          <MessageCircle size={16} />
                          <span>Message</span>
                        </Link>
                        <button className="flex-1 border border-green-300 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold">
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* D. Pending Actions */}
            {getPendingActions().length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Pending Actions
                </h2>

                <div className="space-y-4">
                  {getPendingActions().map((action: any, index: any) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          {action.type === "progress_update" && (
                            <TrendingUp className="text-yellow-600" size={20} />
                          )}
                          {action.type === "customer_approval" && (
                            <Clock className="text-yellow-600" size={20} />
                          )}
                          {action.type === "payment" && (
                            <DollarSign className="text-yellow-600" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {action.message}
                          </p>
                          {action.amount && (
                            <p className="text-sm text-gray-600">
                              Amount: KSh {action.amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/fundi/jobs/${action.jobId}`}
                        className="text-[#FF6B35] hover:text-[#ff5722] font-semibold flex items-center gap-1"
                      >
                        <span>Take Action</span>
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions & Sidebar */}
          <div className="space-y-8">
            {/* E. Quick Actions Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>

              <div className="space-y-3">
                <Link
                  href="/jobs"
                  className="w-full bg-gradient-to-r from-[#FF6B35] to-[#ff8a65] text-white py-4 rounded-xl hover:shadow-lg transition-all font-bold text-center flex items-center justify-center gap-2"
                >
                  <Search size={20} />
                  <span>Find Jobs</span>
                </Link>

                <Link
                  href="/dashboard/fundi/proposals"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  <span>My Proposals</span>
                  <span className="bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full">
                    {proposals.length}
                  </span>
                </Link>

                <Link
                  href="/dashboard/fundi/messages"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>View Messages</span>
                </Link>

                <Link
                  href="/dashboard/fundi/profile"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <User size={16} />
                  <span>Update Profile</span>
                </Link>
              </div>
            </div>

            {/* F. Pending Proposals */}
            {getPendingProposals().length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Pending Proposals
                </h3>
                <div className="space-y-3">
                  {getPendingProposals()
                    .slice(0, 3)
                    .map((proposal, index) => {
                      const StatusIcon =
                        proposalStatusConfig[proposal.proposal.status]?.icon ||
                        Clock;
                      const statusInfo =
                        proposalStatusConfig[proposal.proposal.status] ||
                        proposalStatusConfig.pending;

                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                              {proposal.jobTitle}
                            </h4>
                            <div
                              className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}
                            >
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <User size={12} className="text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {proposal.customer.profile.fullName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              KSh{" "}
                              {proposal.proposal.proposedPrice.toLocaleString()}
                            </span>
                            <Link
                              href={`/jobs/${proposal.jobId}`}
                              className="text-xs text-[#FF6B35] hover:text-[#ff5722]"
                            >
                              View Job
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
                {getPendingProposals().length > 3 && (
                  <Link
                    href="/dashboard/fundi/proposals"
                    className="mt-4 text-center text-[#0A2647] hover:text-[#0d3157] font-semibold text-sm flex items-center justify-center gap-1"
                  >
                    View All Proposals
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            )}

            {/* Recent Customers */}
            {jobs.filter((job) => job.customerId).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Recent Customers
                </h3>
                <div className="space-y-3">
                  {jobs
                    .filter((job) => job.customerId)
                    .slice(0, 3)
                    .map((job, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white font-semibold">
                          {job.customerId.profile?.firstName?.[0]}
                          {job.customerId.profile?.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {job.customerId.profile?.firstName}{" "}
                            {job.customerId.profile?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {job.serviceId.name}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/messages?user=${job.customerId._id}`}
                          className="text-[#FF6B35] hover:text-[#ff5722]"
                        >
                          <MessageCircle size={16} />
                        </Link>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming Deadlines */}
            {jobs.some((job) => job.scheduling?.preferredDate) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Upcoming Deadlines
                </h3>
                <div className="space-y-3">
                  {jobs
                    .filter(
                      (job) =>
                        job.scheduling?.preferredDate &&
                        job.status === "in_progress"
                    )
                    .slice(0, 3)
                    .map((job, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm line-clamp-1">
                            {job.jobDetails.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {job.customerId.profile.fullName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatDate(job.scheduling.preferredDate)}
                          </p>
                          <p className="text-xs text-gray-600">
                            Preferred Date
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
