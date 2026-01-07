import { useState, useEffect } from "react";
import Link from "next/link";
import { jobService } from "@/lib/api/services";
import {
  Plus,
  Clock,
  DollarSign,
  MapPin,
  Wrench,
  User,
  Calendar,
  AlertCircle,
  Loader,
  CheckCircle,
  XCircle,
  TrendingUp,
  Hourglass,
  Zap,
  Briefcase,
  Search,
  Building,
} from "lucide-react";
import { IJob } from "@/types/JobType";
import { useAuth } from "@/contexts/AuthContext";

// Status configuration for jobs where user is the customer
const customerStatusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: any;
    iconColor?: string;
  }
> = {
  posted: {
    label: "Posted",
    color: "bg-blue-50 text-blue-800",
    icon: Zap,
    iconColor: "text-blue-500",
  },
  applied: {
    label: "Applied",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
    iconColor: "text-blue-500",
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Hourglass,
    iconColor: "text-yellow-500",
  },
  assigned: {
    label: "Assigned",
    color: "bg-indigo-100 text-indigo-800",
    icon: User,
    iconColor: "text-indigo-500",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-100 text-purple-800",
    icon: TrendingUp,
    iconColor: "text-purple-500",
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
  disputed: {
    label: "Disputed",
    color: "bg-orange-100 text-orange-800",
    icon: AlertCircle,
    iconColor: "text-orange-500",
  },
};

// Status configuration for jobs where user is the fundi (service provider)
const fundiStatusConfig: Record<
  string,
  {
    label: string;
    color: string;
    icon: any;
    iconColor?: string;
  }
> = {
  applied: {
    label: "Applied",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
    iconColor: "text-blue-500",
  },
  proposal_sent: {
    label: "Proposal Sent",
    color: "bg-indigo-100 text-indigo-800",
    icon: AlertCircle,
    iconColor: "text-indigo-500",
  },
  hired: {
    label: "Hired",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-purple-100 text-purple-800",
    icon: TrendingUp,
    iconColor: "text-purple-500",
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
  low: { label: "Low", color: "bg-green-100 text-green-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800" },
  emergency: { label: "Urgent", color: "bg-red-100 text-red-800" },
};

// Payment status configuration
const paymentConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  escrow: { label: "Escrow", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Paid", color: "bg-green-100 text-green-800" },
  released: { label: "Released", color: "bg-blue-100 text-blue-800" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
  failed: { label: "Failed", color: "bg-red-100 text-red-800" },
};

type JobCategory = "myPostedJobs" | "myAssignedJobs";

export default function FundiJobsDashboard() {
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState<IJob[]>([]);
  const [myPostedJobs, setMyPostedJobs] = useState<IJob[]>([]);
  const [myAssignedJobs, setMyAssignedJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<JobCategory>("myAssignedJobs");

  const [stats, setStats] = useState({
    posted: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
  });

  console.log("Current User:", user);

  // Check if user is the customer in a job
  const isUserCustomer = (job: IJob) => {
    if (!user) return false;
    const customerId =
      typeof job.customerId === "string" ? job.customerId : job.customerId?._id;
    return customerId === user._id;
  };

  // Check if user is the fundi in a job
  const isUserFundi = (job: IJob) => {
    if (!user) return false;
    const fundiId =
      typeof job.fundiId === "string" ? job.fundiId : job.fundiId?._id;
    return fundiId === user._id;
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getMyJobs();
      if (data.success) {
        const jobs = data.data || [];
        setAllJobs(jobs);

        // Split jobs into posted (customer) and assigned (fundi)
        const postedJobs = jobs.filter((job) => isUserCustomer(job));
        const assignedJobs = jobs.filter((job) => isUserFundi(job));

        setMyPostedJobs(postedJobs);
        setMyAssignedJobs(assignedJobs);

        // Calculate stats
        const stats = {
          posted: postedJobs.length,
          assigned: assignedJobs.length,
          inProgress: assignedJobs.filter((job) => job.status === "in_progress")
            .length,
          completed: assignedJobs.filter((job) => job.status === "completed")
            .length,
        };

        setStats(stats);
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
    if (user) {
      fetchJobs();
    }
  }, [user]);

  // Format date
  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "";
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return timeString;
  };

  // Get current jobs based on active category
  const getCurrentJobs = () => {
    switch (activeCategory) {
      case "myPostedJobs":
        return myPostedJobs;
      case "myAssignedJobs":
        return myAssignedJobs;
      default:
        return myAssignedJobs;
    }
  };

  // Get category title
  const getCategoryTitle = () => {
    switch (activeCategory) {
      case "myPostedJobs":
        return "Jobs I Posted";
      case "myAssignedJobs":
        return "Jobs Assigned to Me";
      default:
        return "Jobs Assigned to Me";
    }
  };

  // Get category description
  const getCategoryDescription = () => {
    switch (activeCategory) {
      case "myPostedJobs":
        return "Jobs you've posted as a customer";
      case "myAssignedJobs":
        return "Jobs where you've been hired as the fundi";
      default:
        return "Jobs where you've been hired as the fundi";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-[#0A2647] flex items-center gap-3">
                <Briefcase size={32} />
                <span>My Jobs</span>
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage jobs you posted and jobs you're working on
              </p>
            </div>

            <div className="flex gap-3">
              {user?.isCustomer && (
                <Link
                  href="/dashboard/fundi/jobs/create"
                  className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#ff5722] transition-colors   flex items-center gap-2"
                >
                  <Plus size={20} />
                  <span>Create New Job</span>
                </Link>
              )}
              <Link
                href="/dashboard/fundi/jobs/available"
                className="bg-[#0A2647] text-white px-6 py-3 rounded-lg hover:bg-[#1a3867] transition-colors   flex items-center gap-2"
              >
                <Search size={20} />
                <span>Browse Jobs</span>
              </Link>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle
                className="text-red-500 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="  text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="text-red-700 hover:text-red-900 text-sm font-medium mt-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Jobs Posted</p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stats.posted}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Building size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Assigned Jobs</p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stats.assigned}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">In Progress</p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stats.completed}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle size={24} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveCategory("myAssignedJobs")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeCategory === "myAssignedJobs"
                    ? "bg-[#FF6B35] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <CheckCircle size={18} />
                Assigned to Me ({stats.assigned})
              </button>
              {user?.isCustomer && (
                <button
                  onClick={() => setActiveCategory("myPostedJobs")}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    activeCategory === "myPostedJobs"
                      ? "bg-[#FF6B35] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Building size={18} />
                  Posted by Me ({stats.posted})
                </button>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-[#0A2647]">
                {getCategoryTitle()}
              </h2>
              <p className="text-gray-600 mt-1">{getCategoryDescription()}</p>
            </div>
          </div>

          {/* Jobs List */}
          {getCurrentJobs().length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl   text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {activeCategory === "myPostedJobs"
                  ? "You haven't posted any job requests yet."
                  : "No jobs have been assigned to you yet. Browse available jobs to get hired."}
              </p>
              <div className="flex gap-3 justify-center">
                {activeCategory === "myPostedJobs" ? (
                  <Link
                    href="/dashboard/fundi/jobs/create"
                    className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#ff5722] transition-colors  "
                  >
                    <Plus size={20} />
                    <span>Post Your First Job</span>
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/fundi/jobs/browse"
                    className="inline-flex items-center gap-2 bg-[#0A2647] text-white px-6 py-3 rounded-lg hover:bg-[#1a3867] transition-colors  "
                  >
                    <Search size={20} />
                    <span>Browse Available Jobs</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Job Cards */}
              {getCurrentJobs().map((job) => {
                // Determine if user is the customer (posted the job) or fundi (assigned)
                const isCustomerJob = activeCategory === "myPostedJobs";
                const statusConfig = isCustomerJob
                  ? customerStatusConfig
                  : fundiStatusConfig;

                // Get status based on role
                let jobStatus = job.status;
                if (!isCustomerJob && jobStatus === "assigned") {
                  jobStatus = "hired"; // For fundi, assigned means hired
                }

                const StatusIcon = statusConfig[jobStatus]?.icon || AlertCircle;
                const statusInfo =
                  statusConfig[jobStatus] || statusConfig.applied;
                const urgencyInfo =
                  urgencyConfig[job.jobDetails?.urgency] || urgencyConfig.low;
                const paymentInfo =
                  paymentConfig[job.payment?.status ?? "pending"] ||
                  paymentConfig.pending;

                return (
                  <Link
                    key={job._id}
                    href={`/dashboard/fundi/jobs/${job._id}?role=${
                      isCustomerJob ? "customer" : "fundi"
                    }`}
                    className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#FF6B35] transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Left Column - Job Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {job.jobDetails?.title}
                                </h3>
                                {/* Role Badge */}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    isCustomerJob
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {isCustomerJob
                                    ? "Posted by Me"
                                    : "Working On"}
                                </span>
                              </div>
                              <p className="text-gray-600 line-clamp-2">
                                {job.jobDetails?.description}
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm   ${statusInfo.color}`}
                            >
                              <StatusIcon
                                size={16}
                                className={statusInfo.iconColor}
                              />
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>

                          {/* Job Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Service */}
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-50 p-2 rounded-lg">
                                <Wrench size={18} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Service</p>
                                <p className="font-medium text-gray-900">
                                  {typeof job.serviceId === "string"
                                    ? job.serviceId
                                    : job.serviceId?.name ?? "Unknown Service"}
                                  {job.subService && (
                                    <span className="text-gray-600 text-sm ml-2">
                                      ({job.subService})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-3">
                              <div className="bg-green-50 p-2 rounded-lg">
                                <MapPin size={18} className="text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Location
                                </p>
                                <p className="font-medium text-gray-900 truncate">
                                  {job.location?.city ||
                                    job.location?.county ||
                                    "N/A"}
                                </p>
                              </div>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center gap-3">
                              <div className="bg-purple-50 p-2 rounded-lg">
                                <Calendar
                                  size={18}
                                  className="text-purple-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Preferred Date
                                </p>
                                <p className="font-medium text-gray-900">
                                  {job.scheduling?.preferredDate
                                    ? formatDate(job.scheduling.preferredDate)
                                    : "Flexible"}
                                  {job.scheduling?.preferredTime && (
                                    <span className="text-gray-600 text-sm ml-2">
                                      {formatTime(job.scheduling.preferredTime)}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Budget */}
                            <div className="flex items-center gap-3">
                              <div className="bg-orange-50 p-2 rounded-lg">
                                <DollarSign
                                  size={18}
                                  className="text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Budget</p>
                                <p className="font-medium text-gray-900">
                                  KSh{" "}
                                  {job.jobDetails?.estimatedBudget?.min || 0}
                                  {job.jobDetails?.estimatedBudget?.max &&
                                    ` - KSh ${job.jobDetails.estimatedBudget.max}`}
                                  {job.agreedPrice && (
                                    <span className="text-green-600   ml-2">
                                      (Agreed: KSh {job.agreedPrice})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                            {/* Show proposals only if user is the customer (owner) */}
                            {isCustomerJob &&
                              job.proposals &&
                              job.proposals.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <div className="bg-blue-100 p-1 rounded-full">
                                    <Briefcase
                                      size={14}
                                      className="text-blue-600"
                                    />
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {job.proposals.length} proposal
                                    {job.proposals.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              )}

                            {/* Show hired fundi info only if user is the customer (owner) */}
                            {isCustomerJob && job.fundiId && (
                              <div className="flex items-center gap-2">
                                <div className="bg-gray-100 p-1 rounded-full">
                                  <User size={14} className="text-gray-600" />
                                </div>
                                <span className="text-sm text-gray-600">
                                  Assigned to:{" "}
                                  {typeof job.fundiId === "string"
                                    ? job.fundiId
                                    : `${
                                        job.fundiId?.profile?.firstName ?? ""
                                      } ${
                                        job.fundiId?.profile?.lastName ?? ""
                                      }`}
                                </span>
                              </div>
                            )}

                            {/* Show customer info only if user is the fundi (service provider) */}
                            {!isCustomerJob && job.customerId && (
                              <div className="flex items-center gap-2">
                                <div className="bg-gray-100 p-1 rounded-full">
                                  <User size={14} className="text-gray-600" />
                                </div>
                                <span className="text-sm text-gray-600">
                                  Customer:{" "}
                                  {typeof job.customerId === "string"
                                    ? job.customerId
                                    : `${
                                        job.customerId?.profile?.firstName ?? ""
                                      } ${
                                        job.customerId?.profile?.lastName ?? ""
                                      }`}
                                </span>
                              </div>
                            )}

                            {/* Urgency (show for all) */}
                            {job.jobDetails?.urgency && (
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyInfo.color}`}
                              >
                                {urgencyInfo.label} Priority
                              </div>
                            )}

                            {/* Payment Status (show for all) */}
                            {job.payment?.status && (
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium ${paymentInfo.color}`}
                              >
                                Payment: {paymentInfo.label}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column - Action/Info */}
                        <div className="lg:w-48 flex flex-col gap-3">
                          {/* View Details Button */}
                          <div className="text-center">
                            <span className="text-[#FF6B35]   text-sm flex items-center justify-center gap-1">
                              View Details
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </span>
                          </div>

                          {/* Created Date */}
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-sm font-medium text-gray-900">
                              {job.createdAt
                                ? formatDate(job.createdAt)
                                : "N/A"}
                            </p>
                          </div>

                          {/* Last Updated */}
                          <div className="text-center">
                            <p className="text-xs text-gray-500">
                              Last Updated
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {job.updatedAt
                                ? formatDate(job.updatedAt)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Quick Tips */}
          {(myPostedJobs.length > 0 || myAssignedJobs.length > 0) && (
            <div className="mt-8 bg-gradient-to-r from-[#0A2647] to-[#1e3a5f] rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg   mb-2">
                    {activeCategory === "myPostedJobs"
                      ? "Managing Your Posted Jobs"
                      : "Working on Assigned Jobs"}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {activeCategory === "myPostedJobs"
                      ? "As the job poster, you can view all proposals, communicate with applicants, and manage the job status."
                      : "You're hired! Communicate with the customer, provide updates, and mark tasks as completed."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="bg-white text-[#0A2647] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors   text-sm">
                    Contact Support
                  </button>
                  {activeCategory === "myPostedJobs" ? (
                    <Link
                      href="/dashboard/fundi/jobs/create"
                      className="border-2 border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#0A2647] transition-colors   text-sm"
                    >
                      Post Another Job
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/fundi/jobs/available"
                      className="border-2 border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#0A2647] transition-colors   text-sm"
                    >
                      Browse More Jobs
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
