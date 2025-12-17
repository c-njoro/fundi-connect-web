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

export default function CustomerDashboard() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    completed: 0,
    totalSpent: 0,
    totalJobs: 0,
  });

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getMyJobs();
      if (data.success) {
        const jobsData = data.data || [];
        setJobs(jobsData);

        // Calculate stats
        let active = 0;
        let pendingProposals = 0;
        let completed = 0;
        let totalSpent = 0;

        jobsData.forEach((job: IJob) => {
          if (job.status === "in_progress") active++;
          if (job.status === "completed") completed++;

          // Count jobs with pending proposals
          if (
            job.proposals &&
            job.proposals.length > 0 &&
            job.status === "posted"
          ) {
            pendingProposals++;
          }

          // Calculate total spent from completed jobs with agreed price
          if (job.status === "completed" && job.agreedPrice) {
            totalSpent += job.agreedPrice;
          }
        });

        setStats({
          active,
          pending: pendingProposals,
          completed,
          totalSpent,
          totalJobs: data.total || jobsData.length,
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

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const getRecentJobs = () => {
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

  const getPendingActions = () => {
    const actions: any = [];

    // Jobs with pending proposals
    jobs.forEach((job) => {
      if (
        job.proposals &&
        job.proposals.length > 0 &&
        job.status === "posted"
      ) {
        actions.push({
          type: "proposals",
          count: job.proposals.length,
          jobId: job._id,
          jobTitle: job.jobDetails.title,
          message: `${job.proposals.length} proposal${
            job.proposals.length !== 1 ? "s" : ""
          } received on "${job.jobDetails.title}"`,
        });
      }

      // Jobs completed but not approved
      if (
        job.status === "completed" &&
        job.completion &&
        !job.completion.customerApproved
      ) {
        actions.push({
          type: "approval",
          jobId: job._id,
          jobTitle: job.jobDetails.title,
          message: `Approve completion for "${job.jobDetails.title}"`,
        });
      }

      // Jobs with recent progress updates
      if (job.workProgress && job.workProgress.length > 0) {
        const lastUpdate = job.workProgress[job.workProgress.length - 1];
        const updateDate = new Date(lastUpdate.timestamp);
        const now = new Date();
        const hoursSinceUpdate =
          (now.getTime() - updateDate.getTime()) / (1000 * 3600);

        if (hoursSinceUpdate < 24 && job.status === "in_progress") {
          actions.push({
            type: "progress",
            jobId: job._id,
            jobTitle: job.jobDetails.title,
            message: `New progress update on "${job.jobDetails.title}"`,
            timestamp: lastUpdate.timestamp,
          });
        }
      }
    });

    return actions.slice(0, 3); // Return top 3 actions
  };

  if (loading) {
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
            onClick={fetchJobs}
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
                Customer Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's your job overview
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2">
                <Filter size={16} />
                <span>Filter</span>
              </button>
              <button
                onClick={fetchJobs}
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
                  <p className="text-sm opacity-90 mt-1">Jobs in progress</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>

            {/* Pending Proposals */}
            <div className="bg-gradient-to-br from-[#FF6B35] to-[#ff8a65] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pending Proposals</p>
                  <p className="text-3xl font-bold mt-2">{stats.pending}</p>
                  <p className="text-sm opacity-90 mt-1">Awaiting review</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users size={24} />
                </div>
              </div>
            </div>

            {/* Completed Jobs */}
            <div className="bg-gradient-to-br from-[#2E7D32] to-[#4CAF50] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Completed Jobs</p>
                  <p className="text-3xl font-bold mt-2">{stats.completed}</p>
                  <p className="text-sm opacity-90 mt-1">Successfully done</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-gradient-to-br from-[#6A1B9A] to-[#9C27B0] rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Spent</p>
                  <p className="text-3xl font-bold mt-2">
                    KSh {stats.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-90 mt-1">On all services</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* B. Recent Job Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Job Activity
                </h2>
                <Link
                  href="/dashboard/customer/jobs"
                  className="text-[#0A2647] hover:text-[#0d3157] font-semibold flex items-center gap-1"
                >
                  View All <ChevronRight size={16} />
                </Link>
              </div>

              {getRecentJobs().length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Jobs Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You haven't posted any jobs yet
                  </p>
                  <Link
                    href="/dashboard/customer/post-job"
                    className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#ff5722] transition-colors font-semibold"
                  >
                    <Plus size={16} />
                    <span>Post Your First Job</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {getRecentJobs().map((job) => {
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
                                <DollarSign size={14} />
                                <span>
                                  KSh {job.jobDetails.estimatedBudget.min}
                                </span>
                              </div>
                            </div>

                            {/* Fundi assigned */}
                            {job.fundiId && (
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {job.fundiId.profile?.firstName?.[0]}
                                  {job.fundiId.profile?.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {job.fundiId.profile?.firstName}{" "}
                                    {job.fundiId.profile?.lastName}
                                  </p>
                                  {job.fundiId.fundiProfile?.ratings && (
                                    <div className="flex items-center gap-1">
                                      <Star
                                        size={12}
                                        className="text-yellow-400 fill-current"
                                      />
                                      <span className="text-xs text-gray-600">
                                        {job.fundiId.fundiProfile.ratings.average.toFixed(
                                          1
                                        )}{" "}
                                        (
                                        {
                                          job.fundiId.fundiProfile.ratings
                                            .totalReviews
                                        }
                                        )
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Proposals count */}
                            {job.proposals &&
                              job.proposals.length > 0 &&
                              !job.fundiId && (
                                <div className="mb-3">
                                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Users size={12} />
                                    <span>
                                      {job.proposals.length} proposal
                                      {job.proposals.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Link
                              href={`/dashboard/customer/jobs/${job._id}`}
                              className="text-[#0A2647] hover:text-[#0d3157] font-medium text-sm flex items-center gap-1"
                            >
                              <Eye size={14} />
                              <span>Details</span>
                            </Link>
                            {job.fundiId && (
                              <button className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1">
                                <MessageCircle size={14} />
                                <span>Message</span>
                              </button>
                            )}
                            {job.status === "posted" && (
                              <button className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1">
                                <XCircle size={14} />
                                <span>Cancel</span>
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
                              <Wrench size={14} />
                              <span>
                                {job.serviceId.name} • {job.subService}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{job.location.city}</span>
                            </div>
                          </div>
                        </div>

                        {job.fundiId && (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white font-semibold">
                              {job.fundiId.profile?.firstName?.[0]}
                              {job.fundiId.profile?.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {job.fundiId.profile?.firstName}{" "}
                                {job.fundiId.profile?.lastName}
                              </p>
                              <div className="flex items-center gap-1">
                                <Phone size={12} className="text-gray-500" />
                                <span className="text-xs text-gray-600">
                                  Call Fundi
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
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
                          href={`/dashboard/customer/jobs/${job._id}`}
                          className="flex-1 bg-[#0A2647] text-white py-2 rounded-lg hover:bg-[#0d3157] transition-colors font-semibold text-center"
                        >
                          View Progress
                        </Link>
                        <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2">
                          <MessageCircle size={16} />
                          <span>Message</span>
                        </button>
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
                          {action.type === "proposals" && (
                            <Users className="text-yellow-600" size={20} />
                          )}
                          {action.type === "approval" && (
                            <ThumbsUp className="text-yellow-600" size={20} />
                          )}
                          {action.type === "progress" && (
                            <TrendingUp className="text-yellow-600" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {action.message}
                          </p>
                          {action.timestamp && (
                            <p className="text-sm text-gray-600">
                              {formatDateTime(action.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/customer/jobs/${action.jobId}`}
                        className="text-[#FF6B35] hover:text-[#ff5722] font-semibold flex items-center gap-1"
                      >
                        <span>Review</span>
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
                  href="/dashboard/customer/jobs/create"
                  className="w-full bg-gradient-to-r from-[#FF6B35] to-[#ff8a65] text-white py-4 rounded-xl hover:shadow-lg transition-all font-bold text-center flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  <span>Post New Job</span>
                </Link>

                <Link
                  href="/fundis"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <Search size={16} />
                  <span>Find Fundis</span>
                </Link>

                <Link
                  href="/dashboard/customer/messages"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  <span>View Messages</span>
                  <span className="bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full">
                    3
                  </span>
                </Link>

                <Link
                  href="/services"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  <span>Browse Services</span>
                </Link>
              </div>
            </div>

            {/* Help & Resources */}
            <div className="bg-gradient-to-br from-[#0A2647] to-[#1e3a5f] rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>Contact Support</span>
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    24/7 Customer Service
                  </p>
                </button>
                <button className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>View Guides</span>
                  </div>
                  <p className="text-sm opacity-90 mt-1">How to get started</p>
                </button>
                <button className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <Award size={16} />
                    <span>Rate Fundis</span>
                  </div>
                  <p className="text-sm opacity-90 mt-1">
                    Leave feedback for completed jobs
                  </p>
                </button>
              </div>
            </div>

            {/* Recent Fundis */}
            {jobs.some((job) => job.fundiId) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Recent Fundis</h3>
                <div className="space-y-3">
                  {jobs
                    .filter((job) => job.fundiId)
                    .slice(0, 3)
                    .map((job, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white font-semibold">
                          {job.fundiId?.profile?.firstName?.[0]}
                          {job.fundiId?.profile?.lastName?.[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {job.fundiId?.profile?.firstName}{" "}
                            {job.fundiId?.profile?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {job.serviceId.name}
                          </p>
                        </div>
                        <button className="text-[#FF6B35] hover:text-[#ff5722]">
                          <MessageCircle size={16} />
                        </button>
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
                    .filter((job) => job.scheduling?.preferredDate)
                    .slice(0, 3)
                    .map((job, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {job.jobDetails.title}
                          </p>
                          <p className="text-xs text-gray-600">
                            {job.serviceId.name}
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
