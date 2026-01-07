import Link from "next/link";
import { serviceService } from "@/lib/api/services";
import { useEffect, useState } from "react";
import { IService } from "@/types/ServiceTypes";
import {
  Search,
  Filter,
  Wrench,
  Home,
  Settings,
  Zap,
  Droplets,
  Hammer,
  PaintBucket,
  Leaf,
  Shield,
  Loader,
  AlertCircle,
  Star,
  Clock,
  DollarSign,
} from "lucide-react";

// Category icons mapping
const categoryIcons: { [key: string]: any } = {
  Construction: Hammer,
  Electrical: Zap,
  Plumbing: Droplets,
  Painting: PaintBucket,
  Cleaning: Home,
  Repair: Settings,
  Gardening: Leaf,
  Security: Shield,
  default: Wrench,
};

export default function Services() {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchServices = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await serviceService.getAllServices();
      console.log("Fetched services:", data);
      if (data.success) {
        setServices(data.data || []);
        return;
      }
      setError(data.message || "Failed to load services");
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Get unique categories for filter
  const categories = [
    ...new Set(services.map((service) => service.category)),
  ].sort();

  // Filter services based on search and category
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading services...</p>
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
            Error Loading Services
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchServices}
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
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-semibold text-[#0A2647] flex items-center justify-center gap-3 mb-4">
            <Wrench size={40} />
            <span>Our Services</span>
          </h1>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto">
            Discover a wide range of professional services offered by skilled
            fundis in your area
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search services by name, category, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900 appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Services Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing{" "}
            <span className="  text-[#0A2647]">{filteredServices.length}</span>
            {filteredServices.length !== services.length ? " filtered " : " "}
            services
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <Wrench size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl   text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              No services match your current search criteria. Try adjusting your
              filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
              className="bg-[#0A2647] text-white px-6 py-2 rounded-lg hover:bg-[#0d3157] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComponent =
                categoryIcons[service.category] || categoryIcons.default;

              return (
                <Link
                  key={service._id.toString()}
                  href={`/services/${service._id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#FF6B35] transition-all duration-300 overflow-hidden group"
                >
                  {/* Service Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
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
                        <div>
                          <h3 className="font-semibold text-gray-900 text-xl group-hover:text-[#FF6B35] transition-colors">
                            {service.name}
                          </h3>
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
                            {service.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {service.description && (
                      <p className="text-gray-600 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Sub-services & Pricing */}
                  <div className="p-6">
                    {service.subServices && service.subServices.length > 0 ? (
                      <div className="space-y-4">
                        <h4 className="  text-gray-900 text-sm uppercase tracking-wide">
                          Popular Services
                        </h4>
                        {service.subServices
                          .slice(0, 3)
                          .map((subService, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {subService.name}
                                </p>
                                {subService.description && (
                                  <p className="text-gray-500 text-xs truncate">
                                    {subService.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <div className="font-semibold text-[#FF6B35]">
                                  KSh {subService.suggestedPrice.min} -{" "}
                                  {subService.suggestedPrice.max}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock size={12} />
                                  <span>
                                    {Math.round(
                                      subService.estimatedDuration / 60
                                    )}
                                    h
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                        {service.subServices.length > 3 && (
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-center text-sm text-gray-500">
                              +{service.subServices.length - 3} more services
                              available
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <DollarSign
                          size={32}
                          className="mx-auto text-gray-400 mb-2"
                        />
                        <p className="text-gray-500 text-sm">
                          Custom pricing available
                        </p>
                      </div>
                    )}

                    {/* View Details CTA */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {service.subServices?.length || 0} services
                        </span>
                        <span className="text-[#FF6B35]   group-hover:text-[#ff5722] transition-colors">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Additional Info Section */}
        <div className="mt-12 bg-gradient-to-r from-[#0A2647] to-[#1e3a5f] rounded-2xl p-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Need a Specific Service?
            </h2>
            <p className="text-blue-100 text-lg mb-6">
              Can't find what you're looking for? Our fundis are skilled in
              various areas and can handle custom requests.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#ff5722] transition-colors  ">
                Request Custom Service
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-[#0A2647] transition-colors  ">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
