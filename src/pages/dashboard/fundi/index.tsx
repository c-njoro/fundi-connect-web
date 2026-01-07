import { useAuth } from "@/contexts/AuthContext";
import { jobService } from "@/lib/api/services";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
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
  RefreshCw,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Shield,
  Settings,
  Sparkles,
  CreditCard,
  Smartphone,
  Tablet,
  Monitor,
  Award as AwardIcon,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Database,
} from "lucide-react";

interface IJob {
  _id: string;
  status:
    | "posted"
    | "applied"
    | "pending_payment_escrow"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "disputed";
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

// Color palettes for charts
const CHART_COLORS = {
  primary: "#0A2647",
  secondary: "#FF6B35",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
  pink: "#EC4899",
  cyan: "#06B6D4",
  gray: "#6B7280",
};

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
    avgJobValue: 0,
    responseTime: 0,
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
  const [timeRange, setTimeRange] = useState("month");

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
        let totalJobValue = 0;

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
              totalJobValue += job.agreedPrice;
            }
          }
        });

        // Calculate success rate (completed jobs / total assigned jobs * 100)
        const successRate =
          assignedJobs.length > 0
            ? Math.round((completed / assignedJobs.length) * 100)
            : 0;

        // Calculate average job value
        const avgJobValue =
          completed > 0 ? Math.round(totalJobValue / completed) : 0;

        // Mock response time (in real app, this would be calculated)
        const responseTime = 24; // hours

        setStats({
          active,
          completed,
          totalEarned,
          pendingPayments,
          successRate,
          avgJobValue,
          responseTime,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  // Prepare data for charts
  const prepareJobStatusData = () => {
    const statusCounts = {
      active: stats.active,
      completed: stats.completed,
      posted: jobs.filter((job) => job.status === "posted").length,
    };

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color:
        name === "active"
          ? CHART_COLORS.warning
          : name === "completed"
          ? CHART_COLORS.success
          : CHART_COLORS.info,
    }));
  };

  const prepareProposalStatusData = () => {
    return [
      {
        name: "Pending",
        value: proposalStats.pending,
        color: CHART_COLORS.warning,
      },
      {
        name: "Accepted",
        value: proposalStats.accepted,
        color: CHART_COLORS.success,
      },
      {
        name: "Rejected",
        value: proposalStats.rejected,
        color: CHART_COLORS.danger,
      },
    ];
  };

  const prepareEarningsTrendData = () => {
    // Mock data for earnings trend (in real app, this would come from API)
    return [
      { month: "Jan", earnings: 15000, jobs: 2 },
      { month: "Feb", earnings: 22000, jobs: 3 },
      { month: "Mar", earnings: 18000, jobs: 2 },
      { month: "Apr", earnings: 25000, jobs: 4 },
      { month: "May", earnings: 30000, jobs: 5 },
      { month: "Jun", earnings: 28000, jobs: 4 },
      { month: "Jul", earnings: 32000, jobs: 5 },
      { month: "Aug", earnings: 35000, jobs: 6 },
      { month: "Sep", earnings: 40000, jobs: 7 },
      { month: "Oct", earnings: 38000, jobs: 6 },
      { month: "Nov", earnings: 42000, jobs: 7 },
      {
        month: "Dec",
        earnings: stats.totalEarned || 45000,
        jobs: stats.completed || 8,
      },
    ];
  };

  const prepareServicePerformanceData = () => {
    // Group jobs by service
    const serviceMap = new Map();
    jobs.forEach((job) => {
      const serviceName = job.serviceId.name;
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, { total: 0, completed: 0 });
      }
      const data = serviceMap.get(serviceName);
      data.total += 1;
      if (job.status === "completed") {
        data.completed += 1;
      }
    });

    return Array.from(serviceMap.entries())
      .map(([name, data]) => ({
        name,
        completionRate:
          data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        totalJobs: data.total,
      }))
      .slice(0, 5);
  };

  if (loading || proposalsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <Loader className="animate-spin h-16 w-16 text-[#0A2647] mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-900 text-lg font-medium">
            Loading Your Dashboard...
          </p>
          <p className="text-gray-600 text-sm mt-2">Preparing your analytics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md">
          <div className="relative inline-block">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="text-red-600" size={16} />
              </div>
            </div>
          </div>
          <h3 className="text-xl   text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchAssignedJobs}
              className="bg-gradient-to-r from-[#0A2647] to-[#1e3a5f] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all   flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors  ">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-[#0A2647] to-[#1e3a5f] rounded-lg">
                  <Briefcase className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Fundi Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Welcome back! Here's your performance overview
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {["week", "month", "quarter", "year"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? "bg-white text-[#0A2647] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    fetchAssignedJobs();
                    fetchProposals();
                    fetchProposalsStats();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0A2647] to-[#1e3a5f] text-white rounded-lg hover:shadow-lg transition-all  "
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors  ">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Jobs Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-green-600">
                    +12%
                  </span>
                  <TrendingUp className="text-green-500" size={16} />
                </div>
              </div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {stats.active}
              </p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Clock className="text-gray-400" size={14} />
                <span className="text-sm text-gray-600">Currently working</span>
              </div>
            </div>

            {/* Total Earnings Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Avg. Job</p>
                  <p className="  text-gray-900">
                    {formatCurrency(stats.avgJobValue)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {formatCurrency(stats.totalEarned)}
              </p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <CheckCircle className="text-gray-400" size={14} />
                <span className="text-sm text-gray-600">
                  {stats.completed} completed jobs
                </span>
              </div>
            </div>

            {/* Success Rate Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Target className="text-purple-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Trend</p>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-green-600">
                      +5%
                    </span>
                    <TrendingUp className="text-green-500" size={16} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {stats.successRate}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.successRate}%` }}
                ></div>
              </div>
            </div>

            {/* Pending Payments Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <Wallet className="text-orange-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Awaiting</p>
                  <p className="  text-gray-900">
                    {formatCurrency(stats.pendingPayments)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {formatCurrency(stats.pendingPayments)}
              </p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Clock className="text-gray-400" size={14} />
                <span className="text-sm text-gray-600">To be released</span>
              </div>
            </div>
          </div>

          {/* Proposal Stats */}
          {!proposalStatsLoading && (
            <div className="mb-8">
              <h2 className="text-lg   text-gray-900 mb-4">
                Proposal Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Proposals</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {proposalStats.totalProposals}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="text-yellow-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {proposalStats.pending}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accepted</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {proposalStats.accepted}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Percent className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Earnings Trend Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Earnings Trend
                </h2>
                <p className="text-sm text-gray-600">
                  Monthly earnings and job completion
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#0A2647] rounded-full"></div>
                  <span className="text-sm text-gray-600">Earnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#FF6B35] rounded-full"></div>
                  <span className="text-sm text-gray-600">Jobs</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={prepareEarningsTrendData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => {
                      if (name === "earnings")
                        return [formatCurrency(Number(value)), "Earnings"];
                      return [value, "Jobs"];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="earnings"
                    stroke="#0A2647"
                    fill="url(#colorEarnings)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="jobs"
                    stroke="#FF6B35"
                    fill="url(#colorJobs)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient
                      id="colorEarnings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0A2647" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0A2647" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Job Status Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Job Status Distribution
                </h2>
                <p className="text-sm text-gray-600">Current job breakdown</p>
              </div>
              <PieChartIcon className="text-gray-400" size={20} />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareJobStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {prepareJobStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Jobs"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {prepareJobStatusData().map((status, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <p className="text-xs font-medium text-gray-900">
                    {status.value}
                  </p>
                  <p className="text-xs text-gray-600">{status.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Service Performance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Service Performance
                </h2>
                <p className="text-sm text-gray-600">
                  Completion rates by service
                </p>
              </div>
              <Target className="text-gray-400" size={20} />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareServicePerformanceData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "completionRate")
                        return [`${value}%`, "Completion Rate"];
                      return [value, "Jobs"];
                    }}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalJobs"
                    fill="#0A2647"
                    name="Total Jobs"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="completionRate"
                    fill="#10B981"
                    name="Completion Rate"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Proposal Status Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Proposal Status
                </h2>
                <p className="text-sm text-gray-600">
                  Breakdown of your proposals
                </p>
              </div>
              <FileText className="text-gray-400" size={20} />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={prepareProposalStatusData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Proposals"
                    dataKey="value"
                    stroke="#0A2647"
                    fill="#0A2647"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {prepareProposalStatusData().map((status, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <p className="text-xs font-medium text-gray-900">
                    {status.value}
                  </p>
                  <p className="text-xs text-gray-600">{status.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Jobs & Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Jobs */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Assigned Jobs
              </h2>
              <Link
                href="/dashboard/fundi/jobs"
                className="text-[#0A2647] hover:text-[#0d3157]   text-sm flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>

            {getRecentAssignedJobs().length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg   text-gray-900 mb-2">
                  No Assigned Jobs Yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You haven't been assigned any jobs yet. Browse available jobs
                  and submit proposals to get started.
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#ff8a65] text-white px-8 py-3.5 rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  <Search size={20} />
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
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#FF6B35] transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-xl">
                          <Wrench className="text-gray-600" size={20} />
                        </div>
                        <div>
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
                          <h4 className="  text-gray-900">
                            {job.jobDetails.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{job.customerId.profile.fullName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{job.location.city}</span>
                            </div>
                            {job.agreedPrice && (
                              <div className="flex items-center gap-1">
                                <DollarSign size={14} />
                                <span>{formatCurrency(job.agreedPrice)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/fundi/jobs/${job._id}`}
                          className="text-[#0A2647] hover:text-[#0d3157] font-medium text-sm flex items-center gap-1"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/dashboard/messages?user=${job.customerId._id}`}
                          className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1"
                        >
                          <MessageCircle size={14} />
                          <span>Message</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Performance */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#0A2647] to-[#1e3a5f] rounded-2xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/jobs"
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Search size={20} />
                    </div>
                    <div>
                      <p className="font-medium">Find Jobs</p>
                      <p className="text-sm opacity-90">
                        Browse available work
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/dashboard/fundi/proposals"
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-medium">My Proposals</p>
                      <p className="text-sm opacity-90">
                        {proposals.length} total
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/dashboard/fundi/profile"
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-medium">Update Profile</p>
                      <p className="text-sm opacity-90">Enhance visibility</p>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </Link>
                <Link
                  href="/dashboard/fundi/messages"
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <p className="font-medium">Messages</p>
                      <p className="text-sm opacity-90">Chat with customers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full">
                      3
                    </span>
                    <ChevronRight size={16} />
                  </div>
                </Link>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-6">
                Performance Insights
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Clock className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Avg. Response Time
                      </p>
                      <p className="  text-gray-900">{stats.responseTime}h</p>
                    </div>
                  </div>
                  <TrendingDown className="text-green-500" size={16} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Star className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer Rating</p>
                      <div className="flex items-center gap-1">
                        <Star
                          className="text-yellow-400 fill-current"
                          size={14}
                        />
                        <p className="  text-gray-900">4.8</p>
                        <span className="text-sm text-gray-600">
                          (42 reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="text-green-500" size={16} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <AwardIcon className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="  text-gray-900">{stats.successRate}%</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    +8%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
