import { adminService } from "@/lib/api/services";
import { useEffect, useState } from "react";
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
  RadialBarChart,
  RadialBar,
  Treemap,
} from "recharts";
import {
  Users,
  User,
  UserCheck,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Calendar,
  Star,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Shield,
  Settings,
  FileText,
  MessageSquare,
  Bell,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Download,
  Eye,
  Wrench,
  Home,
  ShoppingBag,
  Sparkles,
  Target,
  Percent,
  Zap,
  ShieldCheck,
  UserX,
  CheckSquare,
  Package,
  Loader,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp as TrendingUpIcon,
  BarChart2,
  LineChart as LineChartIcon,
  ShoppingCart,
  Building,
  Tag,
  Filter,
  Search,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
} from "lucide-react";

interface Statistics {
  users: {
    total: number;
    customers: number;
    fundis: number;
    activeUsers: number;
    new: {
      today: number;
      thisWeek: number;
      thisMonth: number;
    };
    growth: {
      percentage: number;
      trend: "up" | "down" | "neutral";
      chart: Array<{
        _id: {
          year: number;
          month: number;
          day: number;
        };
        count: number;
      }>;
    };
  };
  jobs: {
    total: number;
    byStatus: {
      posted: number;
      inProgress: number;
      completed: number;
      cancelled: number;
      disputed: number;
    };
    thisMonth: number;
    successRate: number;
    disputeRate: number;
    avgCompletionDays: number;
    activityChart: Array<{
      _id: {
        year: number;
        month: number;
        day: number;
      };
      posted: number;
      completed: number;
    }>;
  };
  fundis: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    active: number;
    topRated: Array<any>;
  };
  revenue: {
    totalTransactions: number;
    platformRevenue: number;
    monthlyRevenue: number;
    avgTransactionValue: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    data: any;
  }>;
  topPerformers: {
    fundis: Array<{
      profile: {
        firstName: string;
        lastName: string;
        avatar: string;
        fullName: string;
      };
      fundiProfile: {
        ratings: {
          average: number;
          totalReviews: number;
        };
        services: Array<{
          _id: string;
          name: string;
        }>;
        completedJobs: number;
      };
      _id: string;
    }>;
    customers: Array<{
      _id: string;
      jobCount: number;
      completedJobs: number;
      profile: {
        firstName: string;
        lastName: string;
        avatar: string | null;
        fullName: string;
      };
    }>;
    services: Array<{
      _id: string;
      count: number;
      service: {
        _id: string;
        name: string;
        category: string;
        icon: string;
      };
    }>;
  };
  services: Array<{
    service: {
      _id: string;
      name: string;
      category: string;
      icon: string;
    };
    totalJobs: number;
    completedJobs: number;
    completionRate: number;
  }>;
  lastUpdated: string;
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

const STATUS_COLORS = {
  posted: CHART_COLORS.info,
  inProgress: CHART_COLORS.warning,
  completed: CHART_COLORS.success,
  cancelled: CHART_COLORS.danger,
  disputed: CHART_COLORS.purple,
};

const DEVICE_DATA = [
  { name: "Mobile", value: 65, color: CHART_COLORS.primary },
  { name: "Tablet", value: 15, color: CHART_COLORS.secondary },
  { name: "Desktop", value: 20, color: CHART_COLORS.success },
];

const REGION_DATA = [
  { name: "Nairobi", value: 45, color: CHART_COLORS.primary },
  { name: "Mombasa", value: 20, color: CHART_COLORS.secondary },
  { name: "Kisumu", value: 15, color: CHART_COLORS.success },
  { name: "Nakuru", value: 10, color: CHART_COLORS.warning },
  { name: "Other", value: 10, color: CHART_COLORS.gray },
];

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("month"); // day, week, month, year

  const fetchStats = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      console.log("Fetched Statistics:", data);

      if (data.success) {
        setStatistics(data.data);
      } else {
        setError(data.message || "Failed to load Statistics");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching Statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job_posted":
        return <Briefcase className="text-blue-500" size={16} />;
      case "user_registration":
        return <UserPlus className="text-green-500" size={16} />;
      case "review_posted":
        return <Star className="text-yellow-500" size={16} />;
      case "payment_processed":
        return <CreditCard className="text-purple-500" size={16} />;
      default:
        return <Activity className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "posted":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "disputed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Prepare data for charts
  const prepareUserGrowthData = () => {
    if (!statistics?.users?.growth?.chart) return [];
    return statistics.users.growth.chart.map((item) => ({
      date: `${item._id.month}/${item._id.day}`,
      users: item.count,
    }));
  };

  const prepareJobActivityData = () => {
    if (!statistics?.jobs?.activityChart) return [];
    return statistics.jobs.activityChart.map((item) => ({
      date: `${item._id.month}/${item._id.day}`,
      posted: item.posted,
      completed: item.completed,
    }));
  };

  const prepareJobStatusData = () => {
    if (!statistics?.jobs?.byStatus) return [];
    return Object.entries(statistics.jobs.byStatus).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color:
        STATUS_COLORS[name as keyof typeof STATUS_COLORS] || CHART_COLORS.gray,
    }));
  };

  const prepareServicePerformanceData = () => {
    if (!statistics?.services) return [];
    return statistics.services.map((service) => ({
      name: service.service.name,
      completionRate: service.completionRate,
      totalJobs: service.totalJobs,
      completedJobs: service.completedJobs,
    }));
  };

  const prepareRevenueTrendData = () => {
    // Mock data for revenue trend (in real app, this would come from API)
    return [
      { month: "Jan", revenue: 4000, jobs: 24 },
      { month: "Feb", revenue: 3000, jobs: 13 },
      { month: "Mar", revenue: 2000, jobs: 8 },
      { month: "Apr", revenue: 2780, jobs: 11 },
      { month: "May", revenue: 1890, jobs: 6 },
      { month: "Jun", revenue: 2390, jobs: 15 },
      { month: "Jul", revenue: 3490, jobs: 18 },
      { month: "Aug", revenue: 4300, jobs: 21 },
      { month: "Sep", revenue: 4100, jobs: 19 },
      { month: "Oct", revenue: 5200, jobs: 25 },
      { month: "Nov", revenue: 4800, jobs: 22 },
      {
        month: "Dec",
        revenue: statistics?.revenue?.monthlyRevenue || 0,
        jobs: statistics?.jobs?.thisMonth || 0,
      },
    ];
  };

  if (loading) {
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
            Loading Dashboard Analytics...
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Fetching latest platform data
          </p>
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
              onClick={fetchStats}
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

  if (!statistics) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Database className="text-white" size={32} />
          </div>
          <p className="text-gray-900 text-lg font-medium">No Data Available</p>
          <p className="text-gray-600 text-sm mt-2">
            Start by adding data to your platform
          </p>
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
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Admin Analytics Dashboard
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-gray-600 text-sm">
                      Last updated: {formatDate(statistics.lastUpdated)}
                    </p>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-xs text-green-600 font-medium">
                        Live
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {["day", "week", "month", "year"].map((range) => (
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
                  onClick={fetchStats}
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
            {/* Total Users Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-sm font-medium ${
                      statistics.users.growth.trend === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {statistics.users.growth.percentage}%
                  </span>
                  {statistics.users.growth.trend === "up" ? (
                    <TrendingUp className="text-green-500" size={16} />
                  ) : (
                    <TrendingDown className="text-red-500" size={16} />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {statistics.users.total.toLocaleString()}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Customers</p>
                  <p className="  text-gray-900">
                    {statistics.users.customers}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Fundis</p>
                  <p className="  text-gray-900">{statistics.users.fundis}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="  text-gray-900">
                    {statistics.users.activeUsers}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Jobs Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <Briefcase className="text-green-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">This Month</p>
                  <p className="  text-gray-900">{statistics.jobs.thisMonth}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {statistics.jobs.total.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Success Rate</p>
                  <div className="flex items-center gap-1">
                    <Target className="text-green-500" size={14} />
                    <p className="  text-gray-900">
                      {statistics.jobs.successRate}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg. Days</p>
                  <div className="flex items-center gap-1">
                    <Clock className="text-blue-500" size={14} />
                    <p className="  text-gray-900">
                      {statistics.jobs.avgCompletionDays}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <DollarSign className="text-purple-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Monthly</p>
                  <p className="  text-gray-900">
                    {formatCurrency(statistics.revenue.monthlyRevenue)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Platform Revenue</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {formatCurrency(statistics.revenue.platformRevenue)}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Transactions</p>
                  <p className="  text-gray-900">
                    {formatCurrency(statistics.revenue.totalTransactions)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg. Value</p>
                  <p className="  text-gray-900">
                    {formatCurrency(statistics.revenue.avgTransactionValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Fundis Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-xl">
                  <Wrench className="text-orange-600" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="  text-gray-900">{statistics.fundis.active}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Fundi Management</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {statistics.fundis.total}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle className="text-green-500" size={14} />
                    <p className="  text-gray-900">
                      {statistics.fundis.approved}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="text-yellow-500" size={14} />
                    <p className="  text-gray-900">
                      {statistics.fundis.pending}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue & Growth Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Revenue Growth
                </h2>
                <p className="text-sm text-gray-600">
                  Platform performance over time
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#0A2647] rounded-full"></div>
                  <span className="text-sm text-gray-600">Revenue</span>
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
                  data={prepareRevenueTrendData()}
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
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0A2647"
                    fill="url(#colorRevenue)"
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
                      id="colorRevenue"
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
            <div className="grid grid-cols-5 gap-2 mt-4">
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

          {/* User Growth Trend */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  User Growth Trend
                </h2>
                <p className="text-sm text-gray-600">
                  New user registrations over time
                </p>
              </div>
              <Users className="text-gray-400" size={20} />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={prepareUserGrowthData()}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#0A2647"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
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
                    dataKey="completedJobs"
                    fill="#10B981"
                    name="Completed Jobs"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity Timeline
                </h2>
                <p className="text-sm text-gray-600">
                  Live platform activities
                </p>
              </div>
              <Link
                href="/admin/activity"
                className="text-[#0A2647] hover:text-[#0d3157]   text-sm flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {statistics.recentActivity.slice(0, 8).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.type.split("_")[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: System Metrics & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* System Health */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">System Health</h3>
              <Server className="text-gray-400" size={20} />
            </div>
            <div className="space-y-6">
              {[
                { name: "API Response", value: 95, color: "bg-green-500" },
                { name: "Database", value: 98, color: "bg-green-500" },
                { name: "Cache", value: 89, color: "bg-yellow-500" },
                { name: "Uptime", value: 99.9, color: "bg-green-500" },
              ].map((metric, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{metric.name}</span>
                    <span className="text-sm   text-gray-900">
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${metric.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="  text-gray-900 mb-4">Device Usage</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="20%"
                    outerRadius="100%"
                    data={DEVICE_DATA}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      label={{ fill: "#666", position: "insideStart" }}
                      background
                      dataKey="value"
                    />
                    <Legend
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-[#0A2647] to-[#1e3a5f] rounded-2xl p-6 text-white">
            <h3 className="font-semibold text-lg mb-6">Platform Insights</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="text-yellow-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Avg. Response Time</p>
                    <p className="text-2xl font-semibold">2.4s</p>
                  </div>
                </div>
                <TrendingDown className="text-green-300" size={20} />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CheckCircle className="text-green-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Customer Satisfaction</p>
                    <p className="text-2xl font-semibold">94%</p>
                  </div>
                </div>
                <TrendingUp className="text-green-300" size={20} />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Globe className="text-blue-300" size={20} />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Active Sessions</p>
                    <p className="text-2xl font-semibold">247</p>
                  </div>
                </div>
                <TrendingUp className="text-green-300" size={20} />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <h4 className="  mb-4">Regional Distribution</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={REGION_DATA}
                    dataKey="value"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                  >
                    <Tooltip />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Top Performers */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Top Performers</h3>
              <Award className="text-gray-400" size={20} />
            </div>
            <div className="space-y-4">
              {statistics.topPerformers.fundis
                .slice(0, 3)
                .map((fundi, index) => (
                  <div
                    key={fundi._id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-xl flex items-center justify-center text-white font-semibold">
                          {fundi.profile.firstName?.[0]}
                          {fundi.profile.lastName?.[0]}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star size={12} className="text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="  text-gray-900">
                          {fundi.profile.firstName} {fundi.profile.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star
                            className="text-yellow-400 fill-current"
                            size={12}
                          />
                          <span className="text-sm text-gray-600">
                            {fundi.fundiProfile.ratings.average.toFixed(1)} •{" "}
                            {fundi.fundiProfile.completedJobs} jobs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm   text-gray-900">
                        +
                        {Math.round(
                          fundi.fundiProfile.completedJobs * 12500
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="  text-gray-900 mb-4">Performance Trend</h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: "Mon", performance: 65 },
                      { day: "Tue", performance: 75 },
                      { day: "Wed", performance: 82 },
                      { day: "Thu", performance: 78 },
                      { day: "Fri", performance: 85 },
                      { day: "Sat", performance: 90 },
                      { day: "Sun", performance: 88 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Line
                      type="monotone"
                      dataKey="performance"
                      stroke="#0A2647"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
