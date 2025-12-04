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
  Plus,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Reuse the same IJob interface from your existing code
export interface IJob {
  // ... (same as your existing IJob interface)
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
    | "applied"
    | "pending"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "rejected";
  payment: {
    method: "cash" | "mpesa" | "card" | "bank";
    status: "pending" | "paid" | "released" | "refunded" | "failed";
    escrowAmount?: number;
    releaseDate?: string;
  };
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
  workProgress?: Array<{
    updateBy: string;
    message?: string;
    images?: string[];
    stage: "started" | "in_progress" | "completed" | "cancelled" | "delayed";
    timestamp: string;
  }>;
  completion?: {
    completedAt: string;
    completionImages?: string[];
    customerApproved?: boolean;
    completionNotes?: string;
  };
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
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Status configuration (same as before)
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

// Progress Stage configuration
const progressStageConfig = {
  started: {
    label: "Started",
    color: "bg-blue-100 text-blue-800",
    icon: Zap,
    iconColor: "text-blue-500",
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
  delayed: {
    label: "Delayed",
    color: "bg-orange-100 text-orange-800",
    icon: AlertTriangle,
    iconColor: "text-orange-500",
  },
};

export default function FundiJobDetail() {
  const { user } = useAuth();
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startingJob, setStartingJob] = useState<boolean>(false);
  const [updatingProgress, setUpdatingProgress] = useState<boolean>(false);
  const [completingJob, setCompletingJob] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [updateImages, setUpdateImages] = useState<string[]>([]);
  const [completionNotes, setCompletionNotes] = useState<string>("");
  const [completionImages, setCompletionImages] = useState<string[]>([]);
  const [showCompletionModal, setShowCompletionModal] =
    useState<boolean>(false);

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

  const handleStartJob = async () => {
    if (!job) return;

    setStartingJob(true);
    try {
      const response = await jobService.startJob(job._id);
      if (response.success) {
        fetchJob(id!);
        console.log("Job started successfully.");
      } else {
        console.error("Failed to start job:", response.message);
        setError(response.message || "Failed to start job");
      }
    } catch (error) {
      console.error("Error starting job:", error);
      setError("An error occurred while starting the job");
    } finally {
      setStartingJob(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!job || !updateMessage.trim()) return;

    setUpdatingProgress(true);
    try {
      const data = {
        message: updateMessage,
        images: updateImages,
      };

      const response = await jobService.updateProgress(job._id, data);
      if (response.success) {
        fetchJob(id!);
        setUpdateMessage("");
        setUpdateImages([]);
        console.log("Progress updated successfully.");
      } else {
        console.error("Failed to update progress:", response.message);
        setError(response.message || "Failed to update progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      setError("An error occurred while updating progress");
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!job || !completionNotes.trim()) return;

    setCompletingJob(true);
    try {
      const data = {
        completionNotes: completionNotes,
        completionImages: completionImages,
      };

      const response = await jobService.completeJob(job._id, data);
      if (response.success) {
        fetchJob(id!);
        setShowCompletionModal(false);
        setCompletionNotes("");
        setCompletionImages([]);
        console.log("Job completed successfully.");
      } else {
        console.error("Failed to complete job:", response.message);
        setError(response.message || "Failed to complete job");
      }
    } catch (error) {
      console.error("Error completing job:", error);
      setError("An error occurred while completing the job");
    } finally {
      setCompletingJob(false);
    }
  };

  const simulateImageUpload = (files: FileList) => {
    // In a real app, you would upload to cloud storage and get URLs
    // For now, we'll simulate with placeholder URLs
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      newImages.push(`https://picsum.photos/seed/${Date.now() + i}/400/300`);
    }
    return newImages;
  };

  const isJobAssignedToFundi = () => {
    return job?.fundiId?._id === user?._id; // You'll need to replace with actual fundi ID from auth
  };

  const canStartJob = () => {
    if (!job) return false;
    return (
      isJobAssignedToFundi() &&
      (!job.workProgress || job.workProgress.length === 0)
    );
  };

  const canUpdateProgress = () => {
    return (
      isJobAssignedToFundi() &&
      job?.status === "in_progress" &&
      job.workProgress &&
      job.workProgress.length > 0
    );
  };

  const canCompleteJob = () => {
    return isJobAssignedToFundi() && job?.status === "in_progress";
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
              href="/dashboard/fundi"
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
            href="/dashboard/fundi"
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

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/fundi"
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

            {canStartJob() && (
              <button
                onClick={handleStartJob}
                disabled={startingJob}
                className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-[#ff5722] transition-colors font-semibold flex items-center gap-2"
              >
                {startingJob ? (
                  <Loader className="animate-spin h-4 w-4" />
                ) : (
                  <Zap size={16} />
                )}
                <span>{startingJob ? "Starting..." : "Start Job"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {job.jobDetails?.title}
                </h1>

                {/* Service Link */}
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
                  <Wrench size={18} />
                  <span className="font-semibold">{job.serviceId?.name}</span>
                  {job.subService && (
                    <span className="text-blue-600">• {job.subService}</span>
                  )}
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
            </div>

            {/* Work Progress Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={24} />
                  <span>Work Progress</span>
                  {job.workProgress && job.workProgress.length > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      {job.workProgress.length} update
                      {job.workProgress.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </h2>
              </div>

              {job.workProgress && job.workProgress.length > 0 ? (
                <div className="space-y-6">
                  {job.workProgress.map((progress, index) => {
                    const ProgressIcon =
                      progressStageConfig[progress.stage]?.icon || Info;
                    const progressInfo =
                      progressStageConfig[progress.stage] ||
                      progressStageConfig.in_progress;

                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-6 hover:border-[#FF6B35] transition-colors"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className={`p-3 rounded-lg ${progressInfo.color}`}
                          >
                            <ProgressIcon
                              size={20}
                              className={progressInfo.iconColor}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900 capitalize">
                                {progress.stage?.replace("_", " ")}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {formatDateTime(progress.timestamp)}
                              </span>
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
                      </div>
                    );
                  })}

                  {/* Update Progress Form (if job is in progress) */}
                  {canUpdateProgress() && (
                    <div className="border border-gray-300 rounded-xl p-6 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Update Progress
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Progress Update Message
                          </label>
                          <textarea
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            placeholder="Describe what you've done (e.g., 'Cut the pipes to size', 'Installed new fixtures', etc.)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            rows={4}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Add Progress Images (Optional)
                          </label>
                          <div className="flex gap-3">
                            {updateImages.map((image, index) => (
                              <div key={index} className="relative">
                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <ImageIcon
                                    size={24}
                                    className="text-gray-400"
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    setUpdateImages(
                                      updateImages.filter((_, i) => i !== index)
                                    )
                                  }
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B35] transition-colors">
                              <Upload
                                size={24}
                                className="text-gray-400 mb-2"
                              />
                              <span className="text-sm text-gray-500">Add</span>
                              <input
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    const newImages = simulateImageUpload(
                                      e.target.files
                                    );
                                    setUpdateImages([
                                      ...updateImages,
                                      ...newImages,
                                    ]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <button
                          onClick={handleUpdateProgress}
                          disabled={updatingProgress || !updateMessage.trim()}
                          className="w-full bg-[#FF6B35] text-white py-3 rounded-lg hover:bg-[#ff5722] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {updatingProgress ? (
                            <>
                              <Loader className="animate-spin h-4 w-4" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              <span>Update Progress</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Hourglass size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {canStartJob() ? "Ready to Start" : "No Progress Yet"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    {canStartJob()
                      ? "This job has been assigned to you. Click 'Start Job' to begin working and start tracking progress."
                      : "Work progress updates will appear here once you start working on the job."}
                  </p>
                </div>
              )}
            </div>

            {/* Complete Job Button (if job is in progress) */}
            {canCompleteJob() && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Ready to Complete the Job?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Once you complete the job, you'll need to provide completion
                    notes and images for customer review.
                  </p>
                  <button
                    onClick={() => setShowCompletionModal(true)}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 mx-auto"
                  >
                    <CheckCircle size={20} />
                    <span>Complete Job</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} />
                <span>Customer</span>
              </h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {job.customerId?.profile?.firstName?.[0]}
                  {job.customerId?.profile?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {job.customerId?.profile?.firstName}{" "}
                    {job.customerId?.profile?.lastName}
                  </p>
                  {job.customerId?.profile?.isVerified && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Shield size={12} />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-[#0A2647] text-white py-2 rounded-lg font-semibold hover:bg-[#0d3157] transition-colors flex items-center justify-center gap-2">
                  <Phone size={16} />
                  <span>Call Customer</span>
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle size={16} />
                  <span>Message</span>
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Complete Job
                </h3>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Notes
                  </label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Describe the work completed, any challenges faced, and final outcome..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Images
                  </label>
                  <div className="flex gap-3">
                    {completionImages.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-400" />
                        </div>
                        <button
                          onClick={() =>
                            setCompletionImages(
                              completionImages.filter((_, i) => i !== index)
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B35] transition-colors">
                      <Plus size={20} className="text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add</span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            const newImages = simulateImageUpload(
                              e.target.files
                            );
                            setCompletionImages([
                              ...completionImages,
                              ...newImages,
                            ]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCompletionModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteJob}
                    disabled={completingJob || !completionNotes.trim()}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {completingJob ? (
                      <>
                        <Loader className="animate-spin h-4 w-4" />
                        <span>Completing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Complete Job</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
