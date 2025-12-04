import { useRouter } from "next/router";
import { jobService } from "@/lib/api/services";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
  Home,
  Briefcase,
  FileText,
  Image as ImageIcon,
  ThumbsUp,
  MessageCircle,
  Phone,
  Mail,
  Star,
  Award,
  Shield,
  Download,
  Send,
  Edit,
  MoreVertical,
  ChevronRight,
  AlertTriangle,
  Info,
  CreditCard,
  UserCheck,
  CalendarDays,
  MapPin as MapPinIcon,
} from "lucide-react";
import { set } from "mongoose";

// Simplified interface focused on the job details page
export interface IJob {
  // Core job information
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

  // Identifiers
  _id: string;
  customerId: {
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string | null;
      gender?: string | null;
      languages?: string[];
      isVerified: boolean;
      verificationDocuments?: any[];
      fullName: string;
    };
    location?: {
      coordinates?: {
        type?: string;
        coordinates?: [number, number];
      };
      county?: string;
      city?: string;
      area?: string;
    };
    _id: string;
    isFundi: boolean;
    isCustomer: boolean;
    id: string;
  };

  // Service information
  serviceId: {
    _id: string;
    name: string;
    category: string;
    icon?: string;
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
  };

  subService: string;

  // Location details
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

  // Scheduling
  scheduling: {
    preferredDate: string;
    preferredTime?: string;
    flexibility: "strict" | "flexible" | "negotiable";
  };

  // Job status
  status:
    | "applied"
    | "pending"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "rejected";

  // Payment information
  payment: {
    method: "cash" | "mpesa" | "card" | "bank";
    status: "pending" | "paid" | "released" | "refunded" | "failed";
    escrowAmount?: number;
    releaseDate?: string;
  };

  // Proposals from fundis
  proposals: Array<{
    fundiId: {
      profile: {
        firstName: string;
        lastName: string;
        avatar?: string;
        gender?: string;
        languages?: string[];
        isVerified: boolean;
        verificationDocuments?: any[];
        dateOfBirth?: string;
        fullName: string;
      };
      fundiProfile?: {
        ratings: {
          average: number;
          totalReviews: number;
        };
        completedJobs?: number;
      };
      _id: string;
      isFundi: boolean;
      isCustomer: boolean;
      id: string;
    };
    proposedPrice: number;
    estimatedDuration: number;
    proposal: string;
    status: "pending" | "accepted" | "rejected";
    appliedAt: string;
  }>;

  // Work progress updates
  workProgress?: Array<{
    updateBy: string;
    message?: string;
    images?: string[];
    stage: "started" | "in_progress" | "completed" | "cancelled" | "delayed";
    timestamp: string;
  }>;

  // Completion details (if job is completed)
  completion?: {
    completedAt: string;
    completionImages?: string[];
    customerApproved?: boolean;
    completionNotes?: string;
  };

  // Optional fields
  agreedPrice?: number;
  fundiId?: {
    profile: {
      firstName: string;
      lastName: string;
      avatar?: string;
      gender?: string;
      languages?: string[];
      isVerified: boolean;
      verificationDocuments?: any[];
      dateOfBirth?: string;
      fullName: string;
    };
    fundiProfile: {
      ratings: {
        average: number;
        totalReviews: number;
      };
    };
    _id: string;
    isFundi: boolean;
    isCustomer: boolean;
    id: string;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Status configuration
const statusConfig = {
  applied: {
    label: "Applied",
    color: "bg-blue-100 text-blue-800",
    icon: Hourglass,
    iconColor: "text-blue-500",
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    iconColor: "text-yellow-500",
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
  low: { label: "Low", color: "bg-green-100 text-green-800", icon: Info },
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
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800", icon: Zap },
};

// Payment status configuration
const paymentConfig = {
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
  failed: { label: "Failed", color: "bg-red-100 text-red-800", icon: XCircle },
};

// Payment method configuration
const paymentMethodConfig = {
  cash: { label: "Cash", icon: DollarSign },
  mpesa: { label: "M-Pesa", icon: CreditCard },
  card: { label: "Card", icon: CreditCard },
  bank: { label: "Bank Transfer", icon: CreditCard },
};

export default function CustomerJobDetail() {
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<boolean>(false);
  const [acceptingError, setAcceptingError] = useState<string | null>(null);
  const [approvingPayment, setApprovingPayment] = useState<boolean>(false);
  const [approvingPaymentError, setApprovingPaymentError] = useState<
    string | null
  >(null);

  const fetchJob = async (jobId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getJobById(jobId);
      if (data.success) {
        setJob(data.data);
      } else {
        setError(data.message || "Failed to load job");
      }
    } catch (err: any) {
      console.error("Error fetching job:", err);
      setError(err.message || "An error occurred while fetching job");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format date time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const acceptProposal = async (jobId: string, proposalIndex: number) => {
    setAccepting(true);
    setAcceptingError(null);
    try {
      const response = await jobService.acceptProposal(jobId, proposalIndex);
      if (response.success) {
        fetchJob(id!);
        console.log("Proposal accepted successfully.");
      } else {
        console.error("Failed to accept proposal:", response.message);
        setAcceptingError(response.message || "Failed to accept proposal");
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      setAcceptingError("An error occurred while accepting the proposal");
    } finally {
      setAccepting(false);
    }
  };

  const approveJobPayment = async (jobId: string) => {
    setApprovingPayment(true);
    setApprovingPaymentError(null);

    try {
      const response = await jobService.approveCompletion(jobId);
      if (response.success) {
        fetchJob(id!);
        console.log("Completion approved successfully.");
      } else {
        console.error("Failed to approve completion:", response.message);
        setApprovingPaymentError(
          response.message || "Failed to approve completion"
        );
      }
    } catch (error) {
      console.error("Error approving completion:", error);
      setApprovingPaymentError(
        "An error occurred while approving the completion"
      );
    } finally {
      setApprovingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading job details...</p>
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
            Error Loading Job
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fetchJob(id!)}
              className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/dashboard/customer"
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Job not found</p>
          <Link
            href="/dashboard/customer"
            className="inline-block mt-4 text-[#0A2647] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[job.status]?.icon || AlertCircle;
  const statusInfo = statusConfig[job.status] || statusConfig.applied;
  const urgencyInfo =
    urgencyConfig[job.jobDetails?.urgency] || urgencyConfig.low;
  const UrgencyIcon = urgencyInfo.icon;
  const paymentInfo =
    paymentConfig[job.payment?.status] || paymentConfig.pending;
  const PaymentStatusIcon = paymentInfo.icon;
  const paymentMethodInfo =
    paymentMethodConfig[job.payment?.method] || paymentMethodConfig.cash;
  const PaymentMethodIcon = paymentMethodInfo.icon;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/customer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Jobs</span>
              </Link>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}
              >
                <StatusIcon size={16} className={statusInfo.iconColor} />
                <span>{statusInfo.label}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2">
                <Edit size={20} />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {job.jobDetails?.title}
                  </h1>

                  {/* Service Link */}
                  <Link
                    href={`/services/${job.serviceId?._id}`}
                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Wrench size={18} />
                    <span className="font-semibold">{job.serviceId?.name}</span>
                    {job.subService && (
                      <span className="text-blue-600">• {job.subService}</span>
                    )}
                    <ChevronRight size={16} />
                  </Link>
                </div>

                {/* Urgency Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${urgencyInfo.color}`}
                >
                  <UrgencyIcon size={16} />
                  <span>{urgencyInfo.label} Priority</span>
                </div>
              </div>

              {/* Job Description */}
              {job.jobDetails?.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {job.jobDetails.description}
                  </p>
                </div>
              )}

              {/* Images */}
              {job.jobDetails?.images && job.jobDetails.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Images
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {job.jobDetails.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                      >
                        <ImageIcon size={32} className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Proposals Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck size={24} />
                  <span>Proposals</span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {job.proposals?.length || 0} proposal
                    {job.proposals?.length !== 1 ? "s" : ""}
                  </span>
                </h2>

                <button className="text-[#0A2647] hover:text-[#0d3157] font-semibold flex items-center gap-2">
                  <Send size={16} />
                  <span>Invite Fundis</span>
                </button>
              </div>

              {job.proposals && job.proposals.length > 0 ? (
                <div className="space-y-4">
                  {job.proposals.map((proposal, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-6 hover:border-[#FF6B35] transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Fundi Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            {/* Fundi Avatar */}
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                {proposal.fundiId?.profile?.firstName?.[0]}
                                {proposal.fundiId?.profile?.lastName?.[0]}
                              </div>
                            </div>

                            {/* Fundi Details */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Link
                                  href={`/fundis/${proposal.fundiId?._id}`}
                                  className="font-bold text-gray-900 hover:text-[#FF6B35] transition-colors flex items-center gap-2"
                                >
                                  {proposal.fundiId?.profile?.firstName}{" "}
                                  {proposal.fundiId?.profile?.lastName}
                                  <ChevronRight size={16} />
                                </Link>
                                {proposal.fundiId?.profile?.isVerified && (
                                  <Shield
                                    size={16}
                                    className="text-green-500"
                                  />
                                )}
                              </div>

                              {/* Fundi Rating */}
                              {proposal.fundiId?.fundiProfile?.ratings && (
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center gap-1">
                                    <Star
                                      size={16}
                                      className="text-yellow-400 fill-current"
                                    />
                                    <span className="font-semibold text-gray-900">
                                      {proposal.fundiId.fundiProfile.ratings.average.toFixed(
                                        1
                                      )}
                                    </span>
                                  </div>
                                  <span className="text-gray-500 text-sm">
                                    (
                                    {
                                      proposal.fundiId.fundiProfile.ratings
                                        .totalReviews
                                    }{" "}
                                    reviews)
                                  </span>
                                  {proposal.fundiId.fundiProfile
                                    .completedJobs && (
                                    <span className="text-gray-500 text-sm">
                                      •{" "}
                                      {
                                        proposal.fundiId.fundiProfile
                                          .completedJobs
                                      }{" "}
                                      jobs completed
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Proposal Details */}
                              <div className="mb-4">
                                <p className="text-gray-700">
                                  {proposal.proposal}
                                </p>
                              </div>

                              {/* Proposal Stats */}
                              <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                  <DollarSign
                                    size={16}
                                    className="text-green-600"
                                  />
                                  <span className="font-semibold text-gray-900">
                                    KSh {proposal.proposedPrice}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock size={16} className="text-blue-600" />
                                  <span className="text-gray-600">
                                    {proposal.estimatedDuration} hours
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar
                                    size={16}
                                    className="text-purple-600"
                                  />
                                  <span className="text-gray-600 text-sm">
                                    Applied:{" "}
                                    {formatDateTime(proposal.appliedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Proposal Actions */}
                        <div className="lg:w-48 flex flex-col gap-3">
                          {proposal.status === "pending" && (
                            <>
                              <button
                                className="w-full bg-[#FF6B35] text-white py-2 rounded-lg hover:bg-[#ff5722] transition-colors font-semibold"
                                onClick={() => acceptProposal(job._id, index)}
                                disabled={accepting}
                              >
                                {accepting ? "Accepting..." : "Accept Proposal"}
                              </button>
                              <button className="w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors font-semibold">
                                Reject
                              </button>
                            </>
                          )}
                          {proposal.status === "accepted" && (
                            <div className="text-center">
                              <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg font-semibold">
                                Accepted ✓
                              </div>
                            </div>
                          )}
                          {proposal.status === "rejected" && (
                            <div className="text-center">
                              <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg font-semibold">
                                Rejected ✗
                              </div>
                            </div>
                          )}
                          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center gap-2">
                            <MessageCircle size={16} />
                            <span>Message</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Proposals Yet
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    No fundis have submitted proposals for this job yet. You can
                    invite fundis or wait for proposals to come in.
                  </p>
                  <button className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors font-semibold">
                    Invite Fundis
                  </button>
                </div>
              )}
            </div>

            {/* Work Progress Section */}
            {job.workProgress && job.workProgress.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp size={24} />
                  <span>Work Progress</span>
                </h2>

                <div className="space-y-4">
                  {job.workProgress.map((progress, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-6 pb-6 relative"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full" />

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 capitalize">
                              {progress.stage?.replace("_", " ")}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {formatDateTime(progress.timestamp)}
                            </span>
                          </div>
                          {progress.updateBy === job.customerId?._id && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              By You
                            </span>
                          )}
                        </div>

                        {progress.message && (
                          <p className="text-gray-700 mb-3">
                            {progress.message}
                          </p>
                        )}

                        {progress.images && progress.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
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
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Progress Update Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="flex items-center gap-2 text-[#0A2647] hover:text-[#0d3157] font-semibold">
                    <Edit size={16} />
                    <span>Add Progress Update</span>
                  </button>
                </div>
              </div>
            )}

            {/* Completion Details (if completed) */}
            {job.status === "completed" && job.completion && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle size={24} />
                  <span>Completion Details</span>
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed At</span>
                    <span className="font-semibold text-gray-900">
                      {formatDateTime(job.completion.completedAt)}
                    </span>
                  </div>

                  {job.completion.customerApproved !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Customer Approval</span>
                      <span
                        className={`font-semibold ${
                          job.completion.customerApproved
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {job.completion.customerApproved
                          ? "Approved ✓"
                          : "Not Approved ✗"}
                      </span>
                    </div>
                  )}

                  {job.completion.completionNotes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Completion Notes
                      </h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {job.completion.completionNotes}
                      </p>
                    </div>
                  )}

                  {job.completion.completionImages &&
                    job.completion.completionImages.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Completion Images
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {job.completion.completionImages.map(
                            (image, index) => (
                              <div
                                key={index}
                                className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                              >
                                <ImageIcon
                                  size={32}
                                  className="text-gray-400"
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                {job.status === "applied" && (
                  <button className="w-full bg-[#FF6B35] text-white py-3 rounded-lg hover:bg-[#ff5722] transition-colors font-semibold text-center">
                    Update Job Details
                  </button>
                )}

                {job.status === "in_progress" && (
                  <>
                    <button className="w-full border border-red-300 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors font-semibold text-center">
                      Report Issue
                    </button>
                  </>
                )}

                {job.status === "completed" &&
                  !job.completion?.customerApproved && (
                    <button
                      className="w-full bg-[#0A2647] text-white py-3 rounded-lg hover:bg-[#0d3157] transition-colors font-semibold text-center"
                      onClick={() => approveJobPayment(job._id)}
                    >
                      {approvingPayment
                        ? "Approving..."
                        : "Approve Completion & Release Payment"}
                    </button>
                  )}

                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center flex items-center justify-center gap-2">
                  <Download size={16} />
                  <span>Download Receipt</span>
                </button>

                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-center flex items-center justify-center gap-2">
                  <MessageCircle size={16} />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Job Details</h3>

              <div className="space-y-4">
                {/* Budget */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Budget</span>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      KSh {job.jobDetails?.estimatedBudget?.min}
                      {job.jobDetails?.estimatedBudget?.max &&
                        ` - KSh ${job.jobDetails.estimatedBudget.max}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {job.jobDetails?.estimatedBudget?.currency}
                    </div>
                  </div>
                </div>

                {/* Agreed Price (if exists) */}
                {job.agreedPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Agreed Price</span>
                    <div className="font-bold text-green-600">
                      KSh {job.agreedPrice}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-900">
                    {job.createdAt ? formatDate(job.createdAt) : "N/A"}
                  </span>
                </div>

                {/* Last Updated */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-semibold text-gray-900">
                    {job.updatedAt ? formatDate(job.updatedAt) : "N/A"}
                  </span>
                </div>

                {/* Job ID */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Job ID</span>
                  <span className="font-mono text-sm text-gray-900">
                    {job._id}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon size={18} />
                <span>Location</span>
              </h3>

              <div className="space-y-3">
                {job.location?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      className="text-gray-400 mt-1 flex-shrink-0"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {job.location.address}
                      </p>
                      <p className="text-sm text-gray-600">
                        {[
                          job.location.area,
                          job.location.city,
                          job.location.county,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {job.location.landmark && (
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">Landmark:</span>{" "}
                          {job.location.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <button className="w-full text-[#0A2647] hover:text-[#0d3157] font-semibold text-sm flex items-center gap-2">
                  <MapPin size={16} />
                  <span>View on Map</span>
                </button>
              </div>
            </div>

            {/* Scheduling */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarDays size={18} />
                <span>Scheduling</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Preferred Date</p>
                  <p className="font-semibold text-gray-900">
                    {job.scheduling?.preferredDate
                      ? formatDate(job.scheduling.preferredDate)
                      : "Flexible"}
                  </p>
                </div>

                {job.scheduling?.preferredTime && (
                  <div>
                    <p className="text-sm text-gray-500">Preferred Time</p>
                    <p className="font-semibold text-gray-900">
                      {formatTime(job.scheduling.preferredTime)}
                    </p>
                  </div>
                )}

                {job.scheduling?.flexibility && (
                  <div>
                    <p className="text-sm text-gray-500">Flexibility</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {job.scheduling.flexibility}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={18} />
                <span>Payment</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${paymentInfo.color}`}
                  >
                    <PaymentStatusIcon size={14} />
                    <span>{paymentInfo.label}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Method</span>
                  <div className="flex items-center gap-1">
                    <PaymentMethodIcon size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {paymentMethodInfo.label}
                    </span>
                  </div>
                </div>

                {job.payment?.escrowAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Escrow Amount</span>
                    <span className="font-bold text-gray-900">
                      KSh {job.payment.escrowAmount}
                    </span>
                  </div>
                )}

                {job.payment?.releaseDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Released On</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(job.payment.releaseDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Fundi (if any) */}
            {job.fundiId && (
              <div className="bg-gradient-to-br from-[#0A2647] to-[#1e3a5f] rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-3">Assigned Fundi</h3>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                    {job.fundiId.profile?.firstName?.[0]}
                    {job.fundiId.profile?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-bold">
                      {job.fundiId.profile?.firstName}{" "}
                      {job.fundiId.profile?.lastName}
                    </p>
                    <Link
                      href={`/fundis/${job.fundiId._id}`}
                      className="text-blue-200 hover:text-white text-sm flex items-center gap-1"
                    >
                      View Profile <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full bg-white text-[#0A2647] py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <Phone size={16} />
                    <span>Call Fundi</span>
                  </button>
                  <button className="w-full border border-white text-white py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={16} />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
