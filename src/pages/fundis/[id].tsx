import { useRouter } from "next/router";
import { userService } from "@/lib/api/services";
import { IUser } from "@/types/UserType";
import { useEffect, useState } from "react";
import {
  MapPin,
  Star,
  Briefcase,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  Globe,
  Users,
  TrendingUp,
  FileText,
  Loader,
  AlertCircle,
  Shield,
  BadgeCheck,
} from "lucide-react";

export default function FundiProfile() {
  const [fundiProfile, setFundiProfile] = useState<IUser>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;

  const fetchFundiProfile = async (fundiId: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await userService.getFundiById(fundiId);
      if (data.success) {
        setFundiProfile(data.data);
        console.log("Fundi Profile Data:", data.data);
        return;
      }
      setError(data.message || "Failed to load profile");
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFundiProfile(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading profile...</p>
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
            Error Loading Profile
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchFundiProfile(id!)}
            className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!fundiProfile) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Profile not found</p>
        </div>
      </div>
    );
  }

  const { profile, location, fundiProfile: fundiData } = fundiProfile;

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar and Basic Info */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {profile?.firstName?.[0]}
                  {profile?.lastName?.[0]}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile?.firstName} {profile?.lastName}
                  </h1>
                  {profile?.isVerified && (
                    <BadgeCheck size={24} className="text-blue-500" />
                  )}
                </div>

                {/* Rating and Reviews */}
                {fundiData?.ratings && (
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star
                          size={20}
                          className="text-yellow-400 fill-current"
                        />
                        <span className="font-bold text-gray-900 text-lg">
                          {fundiData.ratings.average.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        ({fundiData.ratings.totalReviews} reviews)
                      </span>
                    </div>

                    {/* Job Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {fundiData.completedJobs !== undefined && (
                        <div className="flex items-center gap-1">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>{fundiData.completedJobs} completed</span>
                        </div>
                      )}
                      {fundiData.cancelledJobs !== undefined &&
                        fundiData.cancelledJobs > 0 && (
                          <div className="flex items-center gap-1">
                            <XCircle size={16} className="text-red-500" />
                            <span>{fundiData.cancelledJobs} cancelled</span>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Location and Experience */}
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  {location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>
                        {[location.area, location.city, location.county]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {fundiData?.experience && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{fundiData.experience} years experience</span>
                    </div>
                  )}

                  {profile?.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{calculateAge(profile.dateOfBirth)} years old</span>
                    </div>
                  )}
                </div>

                {/* Languages */}
                {profile?.languages && profile.languages.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Status */}
            <div className="md:ml-auto">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  fundiData?.availability?.currentStatus === "available"
                    ? "bg-green-100 text-green-800"
                    : fundiData?.availability?.currentStatus === "busy"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    fundiData?.availability?.currentStatus === "available"
                      ? "bg-green-500"
                      : fundiData?.availability?.currentStatus === "busy"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                />
                {fundiData?.availability?.currentStatus === "available"
                  ? "Available"
                  : fundiData?.availability?.currentStatus === "busy"
                  ? "Busy"
                  : "Offline"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio Section */}
            {fundiData?.bio && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  About Me
                </h2>
                <p className="text-gray-700 leading-relaxed">{fundiData.bio}</p>
              </div>
            )}

            {/* Services & Pricing Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase size={20} />
                Services & Pricing
              </h2>

              <div className="space-y-6">
                {fundiData?.services?.map((service, index) => {
                  const servicePricing = fundiData.pricing?.find(
                    (p) =>
                      p.serviceId ===
                      (typeof service === "object" ? service._id : service)
                  );

                  const serviceData =
                    typeof service === "object"
                      ? service
                      : (fundiData.services?.find(
                          (s) => typeof s === "object" && s._id === service
                        ) as any);

                  if (!serviceData) return null;

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {serviceData.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {serviceData.category}
                          </p>
                        </div>
                        {servicePricing && (
                          <div className="text-right">
                            <div className="font-bold text-[#FF6B35] text-lg">
                              KSh {servicePricing.minRate}
                              {servicePricing.maxRate &&
                                ` - KSh ${servicePricing.maxRate}`}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {servicePricing.rateType}
                            </div>
                          </div>
                        )}
                      </div>

                      {serviceData.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {serviceData.description}
                        </p>
                      )}

                      {/* Sub-services */}
                      {serviceData.subServices &&
                        serviceData.subServices.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-700 mb-2">
                              Sub-services:
                            </h4>
                            <div className="space-y-2">
                              {serviceData.subServices.map(
                                (subService: any, subIndex: number) => (
                                  <div
                                    key={subIndex}
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <span className="text-gray-600">
                                      {subService.name}
                                    </span>
                                    {subService.suggestedPrice && (
                                      <span className="font-medium text-gray-900">
                                        KSh {subService.suggestedPrice.min} -{" "}
                                        {subService.suggestedPrice.max}
                                      </span>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Certifications Section */}
            {fundiData?.certifications &&
              fundiData.certifications.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Award size={20} />
                    Certifications & Qualifications
                  </h2>

                  <div className="space-y-4">
                    {fundiData.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              cert.verified ? "bg-green-100" : "bg-blue-100"
                            }`}
                          >
                            <Shield
                              size={20}
                              className={
                                cert.verified
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {cert.name}
                            </h3>
                            {cert.verified && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <CheckCircle size={12} />
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            Issued by: {cert.issuedBy}
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            <span>
                              Issued:{" "}
                              {new Date(cert.dateIssued).toLocaleDateString()}
                            </span>
                            {cert.expiryDate && (
                              <span>
                                Expires:{" "}
                                {new Date(cert.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Portfolio Section */}
            {fundiData?.portfolio && fundiData.portfolio.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Portfolio
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fundiData.portfolio.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {item.description}
                        </p>
                      )}
                      {item.completedDate && (
                        <p className="text-xs text-gray-500">
                          Completed:{" "}
                          {new Date(item.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Action Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Contact & Hire
              </h3>

              <div className="space-y-3 mb-6">
                {fundiProfile.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone size={18} />
                    <span>{fundiProfile.phone}</span>
                  </div>
                )}

                {fundiProfile.email && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={18} />
                    <span className="truncate">{fundiProfile.email}</span>
                  </div>
                )}
              </div>

              <button className="w-full bg-[#FF6B35] text-white py-3 rounded-lg hover:bg-[#ff5722] transition-colors font-semibold mb-3">
                Send Message
              </button>

              <button className="w-full bg-[#0A2647] text-white py-3 rounded-lg hover:bg-[#0d3157] transition-colors font-semibold">
                Request Quote
              </button>
            </div>

            {/* Availability Schedule */}
            {fundiData?.availability?.schedule && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Availability
                </h3>

                <div className="space-y-2">
                  {Object.entries(fundiData.availability.schedule).map(
                    ([day, schedule]: [string, any]) => (
                      <div
                        key={day}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-medium capitalize">{day}</span>
                        <div className="flex items-center gap-2">
                          {schedule.available ? (
                            <>
                              <span className="text-green-600">Available</span>
                              {schedule.hours && (
                                <span className="text-gray-500 text-xs">
                                  {schedule.hours.start} - {schedule.hours.end}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-red-600">Unavailable</span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Profile Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Profile Status
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-semibold ${
                      fundiData?.profileStatus === "approved"
                        ? "text-green-600"
                        : fundiData?.profileStatus === "pending_review"
                        ? "text-yellow-600"
                        : fundiData?.profileStatus === "rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {fundiData?.profileStatus?.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                {fundiData?.approvedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Approved</span>
                    <span className="text-gray-900">
                      {new Date(fundiData.approvedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {fundiData?.suspensionReason && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <strong>Note:</strong> {fundiData.suspensionReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
