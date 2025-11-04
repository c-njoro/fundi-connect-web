import Link from "next/link";
import { userService } from "@/lib/api/services";
import { useEffect, useState } from "react";
import { IUser } from "@/types/UserType";
import {
  MapPin,
  Star,
  Briefcase,
  Award,
  Clock,
  CheckCircle,
  Loader,
  AlertCircle,
} from "lucide-react";

type Params = {
  city: string;
  county: string;
  lat: number | null;
  lng: number | null;
  radius: number | null;
  limit: number | null;
};

export default function Fundis() {
  const [fundis, setFundis] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<Params>({
    city: "",
    county: "",
    lat: null,
    lng: null,
    radius: null,
    limit: 20,
  });

  const fetchFundis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.searchFundis(params);

      if (data.success) {
        setFundis(data.data || []);
        return;
      }
      setError(data.message || "Failed to load fundis");
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching for fundis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundis();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading fundis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Fundis
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFundis}
            className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0A2647] flex items-center gap-3">
            <Briefcase size={32} />
            <span>Find Fundis</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Browse and search fundis who offer services in your area
          </p>
        </div>

        {/* Search Filters - You can expand this later */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Search Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={params.city}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Enter city"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County
              </label>
              <input
                type="text"
                value={params.county}
                onChange={(e) =>
                  setParams((prev) => ({ ...prev, county: e.target.value }))
                }
                placeholder="Enter county"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647]"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchFundis}
                className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-[#ff5722] transition-colors w-full"
              >
                Search Fundis
              </button>
            </div>
          </div>
        </div>

        {/* Fundis Grid */}
        {fundis.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Fundis Found
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No fundis match your current search criteria. Try adjusting your
              filters or search in a different area.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Found{" "}
                <span className="font-semibold text-[#0A2647]">
                  {fundis.length}
                </span>{" "}
                fundis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fundis.map((fundi) => (
                <Link
                  key={fundi._id.toString()}
                  href={`/fundis/${fundi._id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#FF6B35] transition-all duration-300 overflow-hidden group"
                >
                  {/* Fundi Header with Avatar and Basic Info */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0A2647] to-[#FF6B35] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {fundi.profile?.firstName?.[0]}
                          {fundi.profile?.lastName?.[0]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">
                            {fundi.profile?.firstName} {fundi.profile?.lastName}
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
                              <span className="font-semibold text-gray-900">
                                {fundi.fundiProfile.ratings.average.toFixed(1)}
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
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
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
                      </div>
                    </div>
                  </div>

                  {/* Fundi Details */}
                  <div className="p-6 space-y-4">
                    {/* Bio Preview */}
                    {fundi.fundiProfile?.bio && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {fundi.fundiProfile.bio}
                      </p>
                    )}

                    {/* Experience */}
                    {fundi.fundiProfile?.experience && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>
                          {fundi.fundiProfile.experience} years experience
                        </span>
                      </div>
                    )}

                    {/* Services */}
                    {fundi.fundiProfile?.services &&
                      fundi.fundiProfile.services.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 text-sm mb-2">
                            Services
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {fundi.fundiProfile.services
                              .slice(0, 3)
                              .map((service, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                                >
                                  {typeof service === "object" &&
                                  "name" in service
                                    ? service.name
                                    : "Service"}
                                </span>
                              ))}
                            {fundi.fundiProfile!.services.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                +{fundi.fundiProfile!.services.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Certifications */}
                    {fundi.fundiProfile?.certifications &&
                      fundi.fundiProfile.certifications.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award size={14} />
                          <span>
                            {fundi.fundiProfile.certifications.length}{" "}
                            certification(s)
                          </span>
                        </div>
                      )}

                    {/* Job Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {fundi.fundiProfile?.completedJobs !== undefined && (
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {fundi.fundiProfile.completedJobs}
                          </div>
                          <div className="text-xs text-gray-500">Jobs done</div>
                        </div>
                      )}
                      {fundi.fundiProfile?.cancelledJobs !== undefined && (
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {fundi.fundiProfile.cancelledJobs}
                          </div>
                          <div className="text-xs text-gray-500">Cancelled</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="font-semibold text-[#FF6B35] group-hover:text-[#ff5722]">
                          View Profile
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
