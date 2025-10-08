import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { userService } from "@/lib/api/services";
import { IUser } from "@/types/UserType";
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Shield,
  Edit,
  Briefcase,
  Star,
  Award,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Loader,
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import Link from "next/link";

export default function FundiProfile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await userService.getProfile();
        if (data.success) {
          setProfile(data.data);
          return;
        }
        setError(data.message || 'Failed to load profile');
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching profile');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const formatDate = (dateInput: string | Date) => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (!(d instanceof Date) || isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending_review':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'suspended':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending_review':
        return <Clock size={16} className="text-orange-500" />;
      case 'suspended':
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#0A2647] to-[#003366] px-6 py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center text-[#0A2647] text-2xl font-bold">
                  {profile.profile.avatar ? (
                    <img 
                      src={profile.profile.avatar} 
                      alt="Profile" 
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <User size={32} />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profile.profile.firstName} {profile.profile.lastName}
                  </h1>
                  <p className="text-gray-200">Professional Fundi</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full border ${getStatusColor(profile.fundiProfile?.profileStatus || 'draft')}`}>
                      {getStatusIcon(profile.fundiProfile?.profileStatus || 'draft')}
                      <span className="text-sm font-medium capitalize">
                        {profile.fundiProfile?.profileStatus?.replace('_', ' ') || 'draft'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">{profile.fundiProfile?.completedJobs || 0}</div>
                  <div className="text-sm text-gray-200">Jobs Completed</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-2xl font-bold flex items-center justify-center">
                    <Star size={20} className="text-yellow-400 mr-1" />
                    {profile.fundiProfile?.ratings?.average?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-gray-200">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Personal & Contact Info */}
              <div className="xl:col-span-1 space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                      <User size={20} />
                      <span>Personal Information</span>
                    </h2>
                    <button className="text-gray-500 hover:text-[#0A2647] transition-colors duration-200">
                      <Edit size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">First Name:</span>
                      <span className="font-medium text-gray-900">{profile.profile.firstName}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Name:</span>
                      <span className="font-medium text-gray-900">{profile.profile.lastName}</span>
                    </div>
                    
                    {profile.profile.gender && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium text-gray-900 capitalize">{profile.profile.gender}</span>
                      </div>
                    )}
                    
                    {profile.profile.languages && profile.profile.languages.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Languages:</span>
                        <span className="font-medium text-gray-900">
                          {profile.profile.languages.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                      <Mail size={20} />
                      <span>Contact Information</span>
                    </h2>
                    <button className="text-gray-500 hover:text-[#0A2647] transition-colors duration-200">
                      <Edit size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center space-x-2">
                        <Mail size={16} />
                        <span>Email:</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{profile.email}</span>
                        {profile.emailVerified ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-orange-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center space-x-2">
                        <Phone size={16} />
                        <span>Phone:</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{profile.phone}</span>
                        {profile.phoneVerified ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                {profile.location && (
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                        <MapPin size={20} />
                        <span>Location Information</span>
                      </h2>
                      <button className="text-gray-500 hover:text-[#0A2647] transition-colors duration-200">
                        <Edit size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {profile.location.county && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">County:</span>
                          <span className="font-medium text-gray-900">{profile.location.county}</span>
                        </div>
                      )}
                      
                      {profile.location.city && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">City:</span>
                          <span className="font-medium text-gray-900">{profile.location.city}</span>
                        </div>
                      )}
                      
                      {profile.location.area && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium text-gray-900">{profile.location.area}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Fundi Specific Information */}
              <div className="xl:col-span-2 space-y-6">
                {/* Fundi Professional Information */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                      <Briefcase size={20} />
                      <span>Professional Information</span>
                    </h2>
                    <button className="text-gray-500 hover:text-[#0A2647] transition-colors duration-200">
                      <Edit size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Experience & Bio */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Experience</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <TrendingUp size={16} className="text-gray-500" />
                          <span className="text-gray-900 font-medium">
                            {profile.fundiProfile?.experience || 0} years
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Bio</label>
                        <p className="mt-1 text-gray-900 text-sm">
                          {profile.fundiProfile?.bio || "No bio provided yet."}
                        </p>
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Status</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`h-3 w-3 rounded-full ${
                          profile.fundiProfile?.availability?.currentStatus === 'available' 
                            ? 'bg-green-500' 
                            : profile.fundiProfile?.availability?.currentStatus === 'busy'
                            ? 'bg-orange-500'
                            : 'bg-gray-500'
                        }`} />
                        <span className="text-gray-900 font-medium capitalize">
                          {profile.fundiProfile?.availability?.currentStatus || 'offline'}
                        </span>
                      </div>
                      {profile.fundiProfile?.availability?.lastUpdated && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {formatDate(profile.fundiProfile.availability.lastUpdated)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services & Pricing */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                      <DollarSign size={20} />
                      <span>Services & Pricing</span>
                    </h2>
                    <button className="text-gray-500 hover:text-[#0A2647] transition-colors duration-200">
                      <Edit size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Services Offered</label>
                      <div className="mt-2">
                        {profile.fundiProfile?.services && profile.fundiProfile.services.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {profile.fundiProfile.services.map((service, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {String(service)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No services added yet.</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Pricing</label>
                      <div className="mt-2">
                        {profile.fundiProfile?.pricing && profile.fundiProfile.pricing.length > 0 ? (
                          <div className="space-y-2">
                            {profile.fundiProfile.pricing.map((price, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                                <span className="font-medium text-gray-900">{String(price.serviceId)}</span>
                                <div className="text-right">
                                  <span className="text-gray-900 font-bold">
                                    KSh {price.minRate}
                                    {price.maxRate && ` - KSh ${price.maxRate}`}
                                  </span>
                                  <span className="text-gray-500 text-sm block capitalize">{price.rateType}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No pricing information added yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certifications & Portfolio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Certifications */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                        <Award size={20} />
                        <span>Certifications</span>
                      </h2>
                      <button className="text-gray-500 hover:text-[#0A2647] transition-colors duration-200">
                        <Edit size={16} />
                      </button>
                    </div>
                    
                    {profile.fundiProfile?.certifications && profile.fundiProfile.certifications.length > 0 ? (
                      <div className="space-y-3">
                        {profile.fundiProfile.certifications.map((cert, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900">{cert.name}</div>
                            {cert.issuedBy && (
                              <div className="text-sm text-gray-600">Issued by: {cert.issuedBy}</div>
                            )}
                            {cert.dateIssued && (
                              <div className="text-xs text-gray-500">
                                Issued: {formatDate(cert.dateIssued)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No certifications added yet.</p>
                    )}
                  </div>

                  {/* Portfolio */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                        <FileText size={20} />
                        <span>Portfolio</span>
                      </h2>
                      <button className="text-gray-500 hover:text-[#0A2647] transition-colors duration-200">
                        <Edit size={16} />
                      </button>
                    </div>
                    
                    {profile.fundiProfile?.portfolio && profile.fundiProfile.portfolio.length > 0 ? (
                      <div className="space-y-3">
                        {profile.fundiProfile.portfolio.slice(0, 3).map((item, index) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900">{item.title}</div>
                            {item.description && (
                              <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                            )}
                          </div>
                        ))}
                        {profile.fundiProfile.portfolio.length > 3 && (
                          <p className="text-sm text-gray-500 text-center">
                            +{profile.fundiProfile.portfolio.length - 3} more projects
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No portfolio items added yet.</p>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#0A2647] flex items-center space-x-2">
                      <Shield size={20} />
                      <span>Account Status</span>
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Application Date:</span>
                        <span className="font-medium text-gray-900">
                          {profile.fundiProfile?.applicationDate ? formatDate(profile.fundiProfile.applicationDate) : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approval Date:</span>
                        <span className="font-medium text-gray-900">
                          {profile.fundiProfile?.approvedDate ? formatDate(profile.fundiProfile.approvedDate) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed Jobs:</span>
                        <span className="font-medium text-gray-900">{profile.fundiProfile?.completedJobs || 0}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cancelled Jobs:</span>
                        <span className="font-medium text-gray-900">{profile.fundiProfile?.cancelledJobs || 0}</span>
                      </div>
                    </div>
                  </div>

                  

                  {/* Show suspension reason only if profile is suspended */}
                  {profile.fundiProfile?.profileStatus === 'suspended' && profile.fundiProfile?.suspensionReason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-medium text-red-800 mb-2">Suspension Reason</h3>
                      <p className="text-red-700 text-sm">{profile.fundiProfile.suspensionReason}</p>
                    </div>
                  )}

                  {/* button to take me to update profile */}
                  <div className="mt-6 text-center">
                    <Link href="/dashboard/fundi/profile/edit" className="inline-block mt-4 px-4 py-2 bg-[#0A2647] text-white rounded hover:bg-[#003366] transition-colors duration-200">
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}