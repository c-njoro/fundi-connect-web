import Link from "next/link";
import { jobService, serviceService } from "@/lib/api/services";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  AlertCircle,
  Loader,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Award,
  Zap,
  Briefcase,
  ChevronRight,
  Plus,
  X,
  AlertTriangle,
  Info,
  Shield,
  Wrench,
  Send,
} from "lucide-react";
import React from "react";

interface ProposalData {
  proposedPrice: number;
  estimatedDuration: number;
  proposal: string;
}

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
  };
  serviceId: {
    _id: string;
    name: string;
    category: string;
    icon?: string;
  };
  subService: string;
  location: {
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
  status: string;
  payment: {
    method: string;
    status: string;
    escrowAmount: number;
  };
  proposals: any[];
  workProgress: any[];
  createdAt: string;
  updatedAt: string;
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
  }>;
}

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

export default function AvailableJobs() {
  const { user } = useAuth();

  // States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Filter states
  const [selectedService, setSelectedService] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobDetails, setShowJobDetails] = useState<boolean>(false);
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);

  // Proposal states
  const [proposalData, setProposalData] = useState<ProposalData>({
    proposedPrice: 0,
    estimatedDuration: 0,
    proposal: "",
  });
  const [applying, setApplying] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState<boolean>(false);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`;
  };

  // Check if fundi can apply to job
  const alreadyAppliedToJob = (job: Job) => {
    return job.proposals.some((proposal) => proposal.fundiId === user?._id);
  };
  const canApplyToJob = (job: Job) => {
    if (!user?.fundiProfile?.services) return false;
    const alreadyApplied = job.proposals.some(
      (proposal) => proposal.fundiId === user._id
    );

    if (alreadyApplied) return false;

    // Check if the job's service is in fundi's services
    const fundiServiceIds = user.fundiProfile.services || [];
    return fundiServiceIds.includes(job.serviceId._id);
  };

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

  // Fetch jobs
  const fetchJobs = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await jobService.getAllJobs();
      console.log("Fetched Jobs:", data);
      if (data.success) {
        const availableJobs = (data.data || []).filter(
          (j: Job) => j.status === "posted" || j.status === "applied"
        );
        setJobs(availableJobs);
        setFilteredJobs(availableJobs);
      } else {
        setError(data.message || "Failed to load Jobs");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching Jobs");
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs
  useEffect(() => {
    let result = jobs;

    // Filter by service
    if (selectedService !== "all") {
      result = result.filter((job) => job.serviceId._id === selectedService);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.jobDetails.title.toLowerCase().includes(query) ||
          job.jobDetails.description.toLowerCase().includes(query) ||
          job.serviceId.name.toLowerCase().includes(query) ||
          job.subService.toLowerCase().includes(query) ||
          job.location.city.toLowerCase().includes(query) ||
          job.location.county.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(result);
  }, [selectedService, searchQuery, jobs]);

  // Initial data fetch
  useEffect(() => {
    fetchServices();
    fetchJobs();
  }, []);

  // Handle job selection for details
  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  // Handle job selection for application
  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job);
    setApplyJobId(job._id);
    // Set initial proposal price as job's min budget
    setProposalData({
      proposedPrice: job.jobDetails.estimatedBudget.min,
      estimatedDuration: 0,
      proposal: "",
    });
    setShowApplyModal(true);
  };

  // Submit proposal
  const submitProposal = async (jobId: string) => {
    setProposalError(null);
    setApplying(true);

    // Validate proposal data
    if (
      proposalData.proposedPrice <= 0 ||
      proposalData.estimatedDuration <= 0 ||
      proposalData.proposal.trim() === ""
    ) {
      setProposalError("Please fill in all proposal fields correctly.");
      setApplying(false);
      return;
    }

    try {
      const response = await jobService.submitProposal(jobId, proposalData);
      if (response.success) {
        // Refresh jobs list
        fetchJobs();
        // Reset form
        setProposalData({
          proposedPrice: 0,
          estimatedDuration: 0,
          proposal: "",
        });
        // Close modal
        setShowApplyModal(false);
        setApplyJobId(null);
        alert("Proposal submitted successfully!");
      } else {
        setProposalError(response.message || "Failed to submit proposal");
      }
    } catch (error: any) {
      console.error("Error submitting proposal:", error);
      setProposalError(
        error.message ||
          "An error occurred while submitting your proposal. Please try again."
      );
    } finally {
      setApplying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading available jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Available Jobs
              </h1>
              <p className="text-gray-600">
                Browse and apply to jobs that match your skills
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent w-full md:w-64"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Services</option>
                  {services.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name}
                    </option>
                  ))}
                </select>
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg   text-gray-900 mb-2">Error Loading Jobs</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchJobs}
              className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg   text-gray-900 mb-2">No Jobs Available</h3>
            <p className="text-gray-600">
              {searchQuery || selectedService !== "all"
                ? "No jobs match your filters. Try adjusting your search."
                : "There are no available jobs at the moment. Please check back later."}
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className=" ">{filteredJobs.length}</span> of{" "}
                <span className=" ">{jobs.length}</span> available jobs
              </p>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const urgencyInfo =
                  urgencyConfig[job.jobDetails.urgency] || urgencyConfig.low;
                const UrgencyIcon = urgencyInfo.icon;
                const canApply = canApplyToJob(job);

                return (
                  <div
                    key={job._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Job Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Wrench size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="  text-gray-900">
                                {job.serviceId.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {job.subService}
                              </p>
                            </div>
                          </div>

                          <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {job.jobDetails.title}
                          </h2>
                        </div>

                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs   ${urgencyInfo.color}`}
                        >
                          <UrgencyIcon size={12} />
                          <span>{urgencyInfo.label}</span>
                        </div>
                      </div>

                      {/* Job Description Preview */}
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {job.jobDetails.description}
                      </p>

                      {/* Job Details */}
                      <div className="space-y-3 mb-6">
                        {/* Budget */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Budget</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(job.jobDetails.estimatedBudget.min)}
                            {job.jobDetails.estimatedBudget.max &&
                              ` - ${formatCurrency(
                                job.jobDetails.estimatedBudget.max
                              )}`}
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            {job.location.city}, {job.location.county}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            {formatDate(job.scheduling.preferredDate)}
                          </span>
                        </div>

                        {/* Customer */}
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-gray-600">
                            {job.customerId.profile.firstName}{" "}
                            {job.customerId.profile.lastName}
                          </span>
                          {job.customerId.profile.isVerified && (
                            <Shield size={14} className="text-green-500" />
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewJobDetails(job)}
                          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors   flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => handleApplyToJob(job)}
                          disabled={!canApply}
                          className={`flex-1 py-2 rounded-lg   flex items-center justify-center gap-2 ${
                            canApply
                              ? "bg-[#FF6B35] text-white hover:bg-[#ff5722] transition-colors"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Plus size={16} />
                          <span>Apply</span>
                        </button>
                      </div>

                      {/* Apply Status Message */}
                      {!canApply && (
                        <p
                          className={`text-sm text-${
                            alreadyAppliedToJob(job) ? "green" : "red"
                          }-500 mt-2 text-center`}
                        >
                          {alreadyAppliedToJob(job)
                            ? "You have already applied to this job."
                            : "You do not offer services required for this job."}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0  bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Job Details
                </h2>
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Job Content */}
              <div className="space-y-6">
                {/* Job Header */}
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 mb-3">
                    {selectedJob.jobDetails.title}
                  </h1>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
                      <Wrench size={18} />
                      <span className=" ">{selectedJob.serviceId.name}</span>
                      <span className="text-blue-600">
                        • {selectedJob.subService}
                      </span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm   ${
                        urgencyConfig[selectedJob.jobDetails.urgency]?.color ||
                        urgencyConfig.low.color
                      }`}
                    >
                      {urgencyConfig[selectedJob.jobDetails.urgency]?.icon &&
                        React.createElement(
                          urgencyConfig[selectedJob.jobDetails.urgency].icon,
                          { size: 16 }
                        )}
                      <span>
                        {urgencyConfig[selectedJob.jobDetails.urgency]?.label ||
                          "Low"}{" "}
                        Priority
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg   text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedJob.jobDetails.description}
                  </p>
                </div>

                {/* Images */}
                {selectedJob.jobDetails.images &&
                  selectedJob.jobDetails.images.length > 0 && (
                    <div>
                      <h3 className="text-lg   text-gray-900 mb-3">Images</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedJob.jobDetails.images.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                          >
                            <img
                              src={image}
                              alt={`Job image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="  text-gray-900 mb-2">Budget</h4>
                    <p className="text-2xl font-semibold text-green-600">
                      {formatCurrency(
                        selectedJob.jobDetails.estimatedBudget.min
                      )}
                      {selectedJob.jobDetails.estimatedBudget.max &&
                        ` - ${formatCurrency(
                          selectedJob.jobDetails.estimatedBudget.max
                        )}`}
                    </p>
                  </div>

                  {/* Location */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="  text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      <span>Location</span>
                    </h4>
                    <p className="text-gray-700">
                      {selectedJob.location.address && (
                        <>
                          {selectedJob.location.address}
                          <br />
                        </>
                      )}
                      {[
                        selectedJob.location.area,
                        selectedJob.location.city,
                        selectedJob.location.county,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      {selectedJob.location.landmark && (
                        <>
                          <br />
                          <span className="text-gray-600">
                            <strong>Landmark:</strong>{" "}
                            {selectedJob.location.landmark}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Scheduling */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="  text-gray-900 mb-2 flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Scheduling</span>
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Preferred Date</p>
                        <p className="  text-gray-900">
                          {formatDate(selectedJob.scheduling.preferredDate)}
                        </p>
                      </div>
                      {selectedJob.scheduling.preferredTime && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Preferred Time
                          </p>
                          <p className="  text-gray-900">
                            {formatTime(selectedJob.scheduling.preferredTime)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Flexibility</p>
                        <p className="  text-gray-900 capitalize">
                          {selectedJob.scheduling.flexibility}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="  text-gray-900 mb-2 flex items-center gap-2">
                      <User size={16} />
                      <span>Customer</span>
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white  ">
                        {selectedJob.customerId.profile.firstName?.[0]}
                        {selectedJob.customerId.profile.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedJob.customerId.profile.firstName}{" "}
                          {selectedJob.customerId.profile.lastName}
                        </p>
                        {selectedJob.customerId.profile.isVerified && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Shield size={12} />
                            <span>Verified</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowJobDetails(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors  "
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowJobDetails(false);
                      handleApplyToJob(selectedJob);
                    }}
                    disabled={!canApplyToJob(selectedJob)}
                    className={`flex-1 py-3 rounded-lg   ${
                      canApplyToJob(selectedJob)
                        ? "bg-[#FF6B35] text-white hover:bg-[#ff5722] transition-colors"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Submit Proposal
                </h2>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplyJobId(null);
                    setProposalError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Job Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h3 className="  text-gray-900 mb-2">
                    {selectedJob.jobDetails.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedJob.serviceId.name} • {selectedJob.subService}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Customer Budget:{" "}
                    <span className=" ">
                      {formatCurrency(
                        selectedJob.jobDetails.estimatedBudget.min
                      )}
                      {selectedJob.jobDetails.estimatedBudget.max &&
                        ` - ${formatCurrency(
                          selectedJob.jobDetails.estimatedBudget.max
                        )}`}
                    </span>
                  </p>
                </div>

                {/* Proposal Form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Price (KES)
                  </label>
                  <input
                    type="number"
                    value={proposalData.proposedPrice}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        proposedPrice: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Enter your proposed price"
                    min={0}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={proposalData.estimatedDuration}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        estimatedDuration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Enter estimated duration in hours"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposal Message
                  </label>
                  <textarea
                    value={proposalData.proposal}
                    onChange={(e) =>
                      setProposalData({
                        ...proposalData,
                        proposal: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                    placeholder="Describe your approach, experience, and why you're the best fit for this job..."
                    rows={4}
                  />
                </div>

                {/* Error Message */}
                {proposalError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {proposalError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setApplyJobId(null);
                      setProposalError(null);
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors  "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitProposal(selectedJob._id)}
                    disabled={applying}
                    className="flex-1 bg-[#FF6B35] text-white py-3 rounded-lg hover:bg-[#ff5722] transition-colors   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {applying ? (
                      <>
                        <Loader className="animate-spin h-4 w-4" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Proposal</span>
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
