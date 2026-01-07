import { useRouter } from "next/router";
import { serviceService, userService } from "@/lib/api/services";
import { useEffect, useState } from "react";
import { IService } from "@/types/ServiceTypes";
import { IUser } from "@/types/UserType";
import {
  Wrench,
  Clock,
  DollarSign,
  Users,
  ArrowLeft,
  Loader,
  AlertCircle,
  Star,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Shield,
  Calendar,
  TrendingUp,
  Bookmark,
  Share2,
  Briefcase,
  Award,
  XCircle,
} from "lucide-react";
import Link from "next/link";

// Category icons mapping
const categoryIcons: { [key: string]: any } = {
  Construction: Wrench,
  Electrical: Wrench,
  Plumbing: Wrench,
  Painting: Wrench,
  Cleaning: Wrench,
  Repair: Wrench,
  Gardening: Wrench,
  Security: Shield,
  default: Wrench,
};

export default function ServiceDetails() {
  const { query } = useRouter();
  const id = Array.isArray(query.id) ? query.id[0] : query.id;
  const [service, setService] = useState<IService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedServices, setRelatedServices] = useState<IService[]>([]);

  // Fundis state
  const [fundis, setFundis] = useState<IUser[]>([]);
  const [loadingFundis, setLoadingFundis] = useState(false);
  const [errorFundis, setErrorFundis] = useState<string | null>(null);

  const fetchService = async (serviceId: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await serviceService.getServiceById(serviceId);
      if (data.success) {
        setService(data.data);

        // Fetch related services (same category)
        const allServices = await serviceService.getAllServices();
        if (allServices.success && allServices.data) {
          const related = allServices.data
            .filter(
              (s: IService) =>
                s._id.toString() !== serviceId &&
                s.category === data.data.category
            )
            .slice(0, 3);
          setRelatedServices(related);
        }
        return;
      }
      setError(data.message || "Failed to load service");
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching service");
    } finally {
      setLoading(false);
    }
  };

  const fetchFundisForService = async (serviceId: string) => {
    setErrorFundis(null);
    setLoadingFundis(true);
    try {
      const params = {
        service: serviceId,
        limit: 6,
      };
      const data = await userService.searchFundis(params);
      if (data.success) {
        setFundis(data.data || []);
        return;
      }
      setErrorFundis(data.message || "Failed to load related Fundis");
    } catch (err: any) {
      setErrorFundis(
        err.message || "An error occurred while fetching related Fundis"
      );
    } finally {
      setLoadingFundis(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchService(id);
      fetchFundisForService(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg   text-gray-900 mb-2">
            Error Loading Service
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fetchService(id!)}
              className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/services"
              className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Service not found</p>
          <Link
            href="/services"
            className="inline-block mt-4 text-[#0A2647] hover:underline"
          >
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent =
    categoryIcons[service.category] || categoryIcons.default;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/services"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Services</span>
            </Link>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2">
                <Bookmark size={20} />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2">
                <Share2 size={20} />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="">
                    {service.icon ? (
                      <img
                        src={service.icon}
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <IconComponent size={32} className="text-white" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        {service.name}
                      </h1>
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm  ">
                          {service.category}
                        </span>
                        {service.isActive && (
                          <span className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                            <CheckCircle size={14} />
                            Active Service
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-Services Section */}
            {service.subServices && service.subServices.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Wrench size={24} />
                  <span>Available Sub-Services</span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {service.subServices.length} options
                  </span>
                </h2>

                <div className="space-y-6">
                  {service.subServices.map((subService, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-6 hover:border-[#FF6B35] transition-colors group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="bg-blue-50 p-3 rounded-lg flex-shrink-0">
                              <Wrench size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-xl mb-2">
                                {subService.name}
                              </h3>
                              {subService.description && (
                                <p className="text-gray-600 leading-relaxed">
                                  {subService.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="lg:text-right">
                          <div className="mb-3">
                            <div className="font-semibold text-[#FF6B35] text-2xl">
                              KSh {subService.suggestedPrice.min} -{" "}
                              {subService.suggestedPrice.max}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subService.suggestedPrice.currency}
                            </div>
                          </div>

                          <div className="flex lg:justify-end items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              <span>
                                {Math.round(subService.estimatedDuration / 60)}{" "}
                                hours
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={16} />
                              <span>Professional fundis</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-100">
                        <button className="flex-1 bg-[#FF6B35] text-white py-3 rounded-lg hover:bg-[#ff5722] transition-colors   text-center">
                          Request This Service
                        </button>
                        <button className="flex-1 border border-[#0A2647] text-[#0A2647] py-3 rounded-lg hover:bg-[#0A2647] hover:text-white transition-colors   text-center">
                          Find Fundis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Fundis Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={24} />
                  <span>Available Fundis</span>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {fundis.length} fundis
                  </span>
                </h2>
                <Link
                  href={`/fundis?service=${id}`}
                  className="text-[#0A2647] hover:text-[#0d3157]   flex items-center gap-2"
                >
                  View All Fundis
                  <ArrowLeft size={16} className="rotate-180" />
                </Link>
              </div>

              {loadingFundis ? (
                <div className="flex justify-center py-12">
                  <Loader className="animate-spin h-8 w-8 text-[#0A2647]" />
                </div>
              ) : errorFundis ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">{errorFundis}</p>
                  <button
                    onClick={() => fetchFundisForService(id!)}
                    className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : fundis.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg   text-gray-900 mb-2">
                    No Fundis Available
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    There are currently no fundis offering this service. Check
                    back later or try a different service.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fundis.map((fundi) => (
                    <Link
                      key={fundi._id.toString()}
                      href={`/fundis/${fundi._id}`}
                      className="border border-gray-200 rounded-xl p-6 hover:border-[#FF6B35] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {/* Fundi Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white   text-lg">
                            {fundi.profile?.firstName?.[0]}
                            {fundi.profile?.lastName?.[0]}
                          </div>
                        </div>

                        {/* Fundi Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="  text-gray-900 truncate">
                              {fundi.profile?.firstName}{" "}
                              {fundi.profile?.lastName}
                            </h3>
                            {fundi.profile?.isVerified && (
                              <CheckCircle
                                size={16}
                                className="text-green-500 flex-shrink-0"
                              />
                            )}
                          </div>

                          {/* Rating */}
                          {fundi.fundiProfile?.ratings && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                <Star
                                  size={16}
                                  className="text-yellow-400 fill-current"
                                />
                                <span className="  text-gray-900">
                                  {fundi.fundiProfile.ratings.average.toFixed(
                                    1
                                  )}
                                </span>
                              </div>
                              <span className="text-gray-500 text-sm">
                                ({fundi.fundiProfile.ratings.totalReviews}{" "}
                                reviews)
                              </span>
                            </div>
                          )}

                          {/* Location */}
                          {fundi.location && (
                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                              <MapPin size={14} />
                              <span className="truncate">
                                {[
                                  fundi.location.area,
                                  fundi.location.city,
                                  fundi.location.county,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          )}

                          {/* Experience & Certifications */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {fundi.fundiProfile?.experience && (
                              <div className="flex items-center gap-1">
                                <Briefcase size={14} />
                                <span>
                                  {fundi.fundiProfile.experience} years
                                </span>
                              </div>
                            )}
                            {fundi.fundiProfile?.certifications &&
                              fundi.fundiProfile.certifications.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Award size={14} />
                                  <span>
                                    {fundi.fundiProfile.certifications.length}{" "}
                                    certs
                                  </span>
                                </div>
                              )}
                          </div>

                          {/* Job Stats */}
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                            {fundi.fundiProfile?.completedJobs !==
                              undefined && (
                              <div className="flex items-center gap-1">
                                <CheckCircle
                                  size={12}
                                  className="text-green-500"
                                />
                                <span>
                                  {fundi.fundiProfile.completedJobs} completed
                                </span>
                              </div>
                            )}
                            {fundi.fundiProfile?.cancelledJobs !== undefined &&
                              fundi.fundiProfile.cancelledJobs > 0 && (
                                <div className="flex items-center gap-1">
                                  <XCircle size={12} className="text-red-500" />
                                  <span>
                                    {fundi.fundiProfile.cancelledJobs} cancelled
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Availability Status */}
                      {fundi.fundiProfile?.availability?.currentStatus && (
                        <div className="mt-4 flex justify-end">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              fundi.fundiProfile.availability.currentStatus ===
                              "available"
                                ? "bg-green-100 text-green-800"
                                : fundi.fundiProfile.availability
                                    .currentStatus === "busy"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                fundi.fundiProfile.availability
                                  .currentStatus === "available"
                                  ? "bg-green-500"
                                  : fundi.fundiProfile.availability
                                      .currentStatus === "busy"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                              }`}
                            />
                            {fundi.fundiProfile.availability.currentStatus ===
                            "available"
                              ? "Available"
                              : fundi.fundiProfile.availability
                                  .currentStatus === "busy"
                              ? "Busy"
                              : "Offline"}
                          </div>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Service Benefits */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Why Choose This Service?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                    <Shield size={24} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="  text-gray-900 mb-2">Quality Guaranteed</h3>
                    <p className="text-gray-600">
                      All our fundis are verified and provide quality
                      workmanship with satisfaction guarantee.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <DollarSign size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="  text-gray-900 mb-2">
                      Transparent Pricing
                    </h3>
                    <p className="text-gray-600">
                      Clear, upfront pricing with no hidden costs. Know exactly
                      what you're paying for.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                    <Clock size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="  text-gray-900 mb-2">On-Time Service</h3>
                    <p className="text-gray-600">
                      Professional fundis who respect your time and complete
                      work within agreed timelines.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                    <TrendingUp size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="  text-gray-900 mb-2">
                      Expert Professionals
                    </h3>
                    <p className="text-gray-600">
                      Skilled fundis with proven experience and positive
                      customer reviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Related Services
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedServices.map((relatedService) => {
                    const RelatedIcon =
                      categoryIcons[relatedService.category] ||
                      categoryIcons.default;

                    return (
                      <Link
                        key={relatedService._id.toString()}
                        href={`/services/${relatedService._id}`}
                        className="border border-gray-200 rounded-xl p-6 hover:border-[#FF6B35] hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="">
                            {relatedService.icon ? (
                              <img
                                src={relatedService.icon}
                                alt={relatedService.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <IconComponent size={32} className="text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="  text-gray-900 group-hover:text-[#FF6B35] transition-colors">
                              {relatedService.name}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {relatedService.category}
                            </span>
                          </div>
                        </div>

                        {relatedService.description && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {relatedService.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {relatedService.subServices?.length || 0} services
                          </span>
                          <span className="text-[#FF6B35]   group-hover:text-[#ff5722] transition-colors">
                            View Details →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="  text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button className="w-full bg-[#FF6B35] text-white py-3 rounded-lg hover:bg-[#ff5722] transition-colors   text-center">
                  Request Service
                </button>

                <Link
                  href={`/fundis?service=${service._id}`}
                  className="w-full border border-[#0A2647] text-[#0A2647] py-3 rounded-lg hover:bg-[#0A2647] hover:text-white transition-colors   text-center block"
                >
                  Find Fundis
                </Link>

                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors   text-center">
                  Get Price Estimate
                </button>
              </div>
            </div>

            {/* Service Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="  text-gray-900 mb-4">Service Overview</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category</span>
                  <span className="  text-gray-900">{service.category}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`  ${
                      service.isActive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sub-services</span>
                  <span className="  text-gray-900">
                    {service.subServices?.length || 0}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available Fundis</span>
                  <span className="  text-gray-900">{fundis.length}</span>
                </div>

                {service.createdAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Added</span>
                    <span className="  text-gray-900 text-sm">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-[#0A2647] to-[#1e3a5f] rounded-xl p-6 text-white">
              <h3 className="  mb-3">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Our support team is here to help you find the right service and
                connect with qualified fundis.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-blue-100">
                  <Phone size={16} />
                  <span className="text-sm">+254 700 123 456</span>
                </div>
                <div className="flex items-center gap-3 text-blue-100">
                  <Mail size={16} />
                  <span className="text-sm">support@fundi.com</span>
                </div>
              </div>

              <button className="w-full bg-white text-[#0A2647] py-2 rounded-lg   mt-4 hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
