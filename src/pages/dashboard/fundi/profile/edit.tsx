import { useAuth } from "@/contexts/AuthContext";
import { use, useEffect, useState } from "react";
import { userService, serviceService } from "@/lib/api/services";
import dynamic from "next/dynamic";
const LocationMapModal = dynamic(
  () => import("@/components/LocationMapModal"),
  {
    ssr: false,
  }
);
import {
  Loader,
  User,
  Briefcase,
  DollarSign,
  Award,
  FileText,
  Plus,
  Trash2,
  Save,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Service {
  _id: string;
  name: string;
  category: string;
  icon?: string;
}

export default function FundiProfileEdit() {
  const { token, user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingFundiProfile, setSavingFundiProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [fundiSuccess, setFundiSuccess] = useState<string | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Available services from backend
  const [availableServices, setAvailableServices] = useState<Service[]>([]);

  // User Profile State
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "other" | "",
    languages: [] as string[],
    avatar: "",
    location: {
      type: "Point",
      coordinates: [0, 0] as [number, number],
    },
  });

  // User Location State
  const [location, setLocation] = useState({
    county: "",
    city: "",
    area: "",
    coordinates: {
      lat: 0,
      lng: 0,
    },
  });

  // Fundi Profile State
  const [fundiProfile, setFundiProfile] = useState({
    bio: "",
    experience: 0,
    services: [] as string[],
    pricing: [] as Array<{
      serviceId: string;
      rateType: "hourly" | "fixed" | "negotiable";
      minRate: number;
      maxRate?: number;
      currency: string;
    }>,
    certifications: [] as Array<{
      name: string;
      issuedBy: string;
      dateIssued: string;
      expiryDate?: string;
      certificateUrl: string;
      verified: boolean;
    }>,
    portfolio: [] as Array<{
      title: string;
      description: string;
      images: string[];
      completedDate?: string;
    }>,
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      mpesaNumber: "",
    },
  });

  // Temporary states for adding items
  const [newServiceId, setNewServiceId] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newPricing, setNewPricing] = useState<{
    serviceId: string;
    rateType: "hourly" | "fixed" | "negotiable";
    minRate: number;
    maxRate?: number;
    currency: string;
  }>({
    serviceId: "",
    rateType: "hourly",
    minRate: 0,
    maxRate: undefined,
    currency: "KES",
  });
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuedBy: "",
    dateIssued: "",
    expiryDate: "",
    certificateUrl: "",
    verified: false,
  });
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: "",
    description: "",
    images: [] as string[],
    completedDate: "",
  });

  // Fetch profile and services
  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch user profile
      const profileResponse = await userService.getProfile();
      if (profileResponse.success && profileResponse.data) {
        const data = profileResponse.data;

        // Set user profile
        setUserProfile({
          firstName: data.profile?.firstName || "",
          lastName: data.profile?.lastName || "",
          dateOfBirth: data.profile?.dateOfBirth || "",
          gender: data.profile?.gender || "",
          languages: data.profile?.languages || [],
          avatar: data.profile?.avatar || "",
          location: {
            type: "Point",
            coordinates: data.profile?.location?.coordinates || [0, 0],
          },
        });

        // Set location
        setLocation({
          county: data.location?.county || "",
          city: data.location?.city || "",
          area: data.location?.area || "",
          coordinates: {
            lat:
              data.location?.coordinates?.coordinates[1] ||
              data.profile?.location?.coordinates[1] ||
              0,
            lng:
              data.location?.coordinates?.coordinates[0] ||
              data.profile?.location?.coordinates[0] ||
              0,
          },
        });

        // Set fundi profile if exists
        if (data.fundiProfile) {
          setFundiProfile({
            bio: data.fundiProfile.bio || "",
            experience: data.fundiProfile.experience || 0,
            services:
              data.fundiProfile.services?.map((s: any) => s._id || s) || [],
            pricing: data.fundiProfile.pricing || [],
            certifications: data.fundiProfile.certifications || [],
            portfolio: data.fundiProfile.portfolio || [],
            bankDetails: {
              accountName: data.fundiProfile.bankDetails?.accountName || "",
              accountNumber: data.fundiProfile.bankDetails?.accountNumber || "",
              bankName: data.fundiProfile.bankDetails?.bankName || "",
              mpesaNumber: data.fundiProfile.bankDetails?.mpesaNumber || "",
            },
          });
        }
      }

      // Fetch available services
      const servicesResponse = await serviceService.getAllServices();
      if (servicesResponse.success && servicesResponse.data) {
        setAvailableServices(servicesResponse.data);
      }

      console.log("Recieved location", location);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle location selection from modal
  const handleLocationSelect = (coords: { lat: number; lng: number }) => {
    console.log("Selected coordinates:", coords);
    setLocation((prev) => ({
      ...prev,
      coordinates: coords,
    }));

    // Also update the userProfile location for consistency
    setUserProfile((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [coords.lng, coords.lat] as [number, number], // Note: MongoDB expects [lng, lat]
      },
    }));
  };

  // Update User Profile
  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    setError(null);
    setProfileSuccess(null);

    try {
      const payload = {
        profile: userProfile,
        location: {
          ...location,
          coordinates: location.coordinates,
        },
      };

      const response = await userService.updateProfile(payload);

      if (response.success) {
        setProfileSuccess("Profile updated successfully!");
        fetchData();
        setTimeout(() => setProfileSuccess(null), 3000);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Update Fundi Profile
  const handleUpdateFundiProfile = async () => {
    setSavingFundiProfile(true);
    setError(null);
    setFundiSuccess(null);

    try {
      const response = await userService.updateFundiProfile(fundiProfile);

      if (response.success) {
        setFundiSuccess("Fundi profile updated successfully!");
        fetchData();
        setTimeout(() => setFundiSuccess(null), 3000);
      } else {
        setError(response.message || "Failed to update fundi profile");
      }
    } catch (err: any) {
      console.error("Error updating fundi profile:", err);
      setError(err.response?.data?.message || "Failed to update fundi profile");
    } finally {
      setSavingFundiProfile(false);
    }
  };

  // Language management
  const addLanguage = () => {
    if (
      newLanguage.trim() &&
      !userProfile.languages.includes(newLanguage.trim())
    ) {
      setUserProfile((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setUserProfile((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  // Service management
  const addService = () => {
    if (newServiceId && !fundiProfile.services.includes(newServiceId)) {
      setFundiProfile((prev) => ({
        ...prev,
        services: [...prev.services, newServiceId],
      }));
      setNewServiceId("");
    }
  };

  const removeService = (serviceId: string) => {
    setFundiProfile((prev) => ({
      ...prev,
      services: prev.services.filter((id) => id !== serviceId),
    }));
  };

  // Pricing management
  const addPricing = () => {
    if (newPricing.serviceId && newPricing.minRate > 0) {
      setFundiProfile((prev) => ({
        ...prev,
        pricing: [...prev.pricing, { ...newPricing }],
      }));
      setNewPricing({
        serviceId: "",
        rateType: "hourly",
        minRate: 0,
        maxRate: undefined,
        currency: "KES",
      });
    }
  };

  const removePricing = (index: number) => {
    setFundiProfile((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index),
    }));
  };

  // Certification management
  const addCertification = () => {
    if (newCertification.name && newCertification.issuedBy) {
      setFundiProfile((prev) => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification }],
      }));
      setNewCertification({
        name: "",
        issuedBy: "",
        dateIssued: "",
        expiryDate: "",
        certificateUrl: "",
        verified: false,
      });
    }
  };

  const removeCertification = (index: number) => {
    setFundiProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  // Portfolio management
  const addPortfolioItem = () => {
    if (newPortfolioItem.title) {
      setFundiProfile((prev) => ({
        ...prev,
        portfolio: [...prev.portfolio, { ...newPortfolioItem }],
      }));
      setNewPortfolioItem({
        title: "",
        description: "",
        images: [],
        completedDate: "",
      });
    }
  };

  const removePortfolioItem = (index: number) => {
    setFundiProfile((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }));
  };

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

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0A2647] flex items-center gap-3">
            <User size={32} />
            <span>Edit Profile</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Update your personal information and professional details
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle
              className="text-red-500 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h3 className="  text-red-800">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* ==================== USER PROFILE SECTION ==================== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl   text-[#0A2647] flex items-center gap-2">
                <User size={24} />
                <span>Personal Information</span>
              </h2>
              {profileSuccess && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">{profileSuccess}</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={userProfile.firstName}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={userProfile.lastName}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth:{" "}
                    {userProfile.dateOfBirth
                      ? new Date(userProfile.dateOfBirth).toLocaleDateString()
                      : "Not set"}
                  </label>

                  <input
                    type="date"
                    value={userProfile.dateOfBirth}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        dateOfBirth: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={userProfile.gender}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        gender: e.target.value as any,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                    placeholder="e.g., English, Swahili, Kikuyu"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                  />
                  <button
                    onClick={addLanguage}
                    className="bg-[#0A2647] text-white px-6 py-3 rounded-lg hover:bg-[#0d3157] transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                {userProfile.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {userProfile.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm"
                      >
                        {lang}
                        <button
                          onClick={() => removeLanguage(index)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg   text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Location
                </h3>
                <div className="space-y-6">
                  {/* Address Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        County
                      </label>
                      <input
                        type="text"
                        value={location.county}
                        onChange={(e) =>
                          setLocation((prev) => ({
                            ...prev,
                            county: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City/Town
                      </label>
                      <input
                        type="text"
                        value={location.city}
                        onChange={(e) =>
                          setLocation((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area/Estate
                      </label>
                      <input
                        type="text"
                        value={location.area}
                        onChange={(e) =>
                          setLocation((prev) => ({
                            ...prev,
                            area: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Coordinates Section with Map Button */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exact Coordinates
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">
                            Latitude
                          </div>
                          <div className="text-lg font-mono text-gray-900">
                            {location.coordinates.lat.toFixed(6)}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                          <div className="text-sm font-medium text-gray-700">
                            Longitude
                          </div>
                          <div className="text-lg font-mono text-gray-900">
                            {location.coordinates.lng.toFixed(6)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsLocationModalOpen(true)}
                        className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#ff5722] text-white rounded-lg hover:from-[#ff5722] hover:to-[#FF6B35] transition-all   flex items-center justify-center gap-2"
                      >
                        <MapPin size={20} />
                        {location.coordinates.lat !== 0 &&
                        location.coordinates.lng !== 0
                          ? "Update on Map"
                          : "Set on Map"}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Click "Set on Map" to select your exact location on an
                      interactive map. This helps customers find you more
                      accurately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Profile Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleUpdateProfile}
                  disabled={savingProfile}
                  className="bg-[#0A2647] text-white px-8 py-3 rounded-lg hover:bg-[#0d3157] transition-colors   flex items-center gap-2 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ==================== FUNDI PROFILE SECTION ==================== */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl   text-[#0A2647] flex items-center gap-2">
                <Briefcase size={24} />
                <span>Professional Information</span>
              </h2>
              {fundiSuccess && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">{fundiSuccess}</span>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Bio & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={fundiProfile.bio}
                    onChange={(e) =>
                      setFundiProfile((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    placeholder="Tell clients about your skills, experience, and what makes you stand out..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fundiProfile.bio.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-gray-500" />
                    <input
                      type="number"
                      value={fundiProfile.experience}
                      onChange={(e) =>
                        setFundiProfile((prev) => ({
                          ...prev,
                          experience: parseInt(e.target.value) || 0,
                        }))
                      }
                      min="0"
                      max="50"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <span className="text-gray-600">years</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-lg   text-gray-900 mb-4">
                  Services Offered
                </h3>

                {/* Add Service Section */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Add Service
                  </h4>
                  <div className="flex gap-2">
                    <select
                      value={newServiceId}
                      onChange={(e) => setNewServiceId(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    >
                      <option value="">Select a service to add...</option>
                      {availableServices
                        .filter(
                          (service) =>
                            !fundiProfile.services.includes(service._id)
                        )
                        .map((service) => (
                          <option key={service._id} value={service._id}>
                            {service.name} - {service.category}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={addService}
                      disabled={!newServiceId}
                      className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#ff5722] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} />
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Services Display */}
                {fundiProfile.services.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">
                      Your Services ({fundiProfile.services.length})
                    </h4>
                    {fundiProfile.services.map((serviceId) => {
                      const service = availableServices.find(
                        (s) => s._id === serviceId
                      );
                      return (
                        service && (
                          <div
                            key={service._id}
                            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#FF6B35] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-orange-100 p-2 rounded-lg">
                                <Briefcase
                                  size={20}
                                  className="text-[#FF6B35]"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {service.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {service.category}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeService(service._id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Remove service"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Briefcase
                      size={48}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p className="text-gray-500 text-lg">
                      No services added yet
                    </p>
                    <p className="text-gray-400 text-sm">
                      Use the dropdown above to add your first service
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg   text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} />
                  Pricing
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Add Pricing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <select
                      value={newPricing.serviceId}
                      onChange={(e) =>
                        setNewPricing((prev) => ({
                          ...prev,
                          serviceId: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    >
                      <option value="">Select Service</option>
                      {availableServices
                        .filter((s) => fundiProfile.services.includes(s._id))
                        .map((service) => (
                          <option key={service._id} value={service._id}>
                            {service.name}
                          </option>
                        ))}
                    </select>
                    <select
                      value={newPricing.rateType}
                      onChange={(e) =>
                        setNewPricing((prev) => ({
                          ...prev,
                          rateType: e.target.value as any,
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="fixed">Fixed</option>
                      <option value="negotiable">Negotiable</option>
                    </select>
                    <input
                      type="number"
                      value={newPricing.minRate}
                      onChange={(e) =>
                        setNewPricing((prev) => ({
                          ...prev,
                          minRate: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="Min Rate"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <input
                      type="number"
                      value={newPricing.maxRate ?? ""}
                      onChange={(e) =>
                        setNewPricing((prev) => ({
                          ...prev,
                          maxRate:
                            e.target.value === ""
                              ? undefined
                              : parseInt(e.target.value, 10),
                        }))
                      }
                      placeholder="Max Rate"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <button
                      onClick={addPricing}
                      className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#ff5722] transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>

                {fundiProfile.pricing.length > 0 && (
                  <div className="space-y-2">
                    {fundiProfile.pricing.map((price, index) => {
                      const service = availableServices.find(
                        (s) => s._id === price.serviceId
                      );
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {service?.name || "Unknown Service"}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">
                              {price.rateType}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              KSh {price.minRate}
                              {price.maxRate && ` - KSh ${price.maxRate}`}
                            </div>
                          </div>
                          <button
                            onClick={() => removePricing(index)}
                            className="ml-4 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg   text-gray-900 mb-4 flex items-center gap-2">
                  <Award size={20} />
                  Certifications
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Add Certification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newCertification.name}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Certification Name"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <input
                      type="text"
                      value={newCertification.issuedBy}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          issuedBy: e.target.value,
                        }))
                      }
                      placeholder="Issued By"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <input
                      type="date"
                      value={newCertification.dateIssued}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          dateIssued: e.target.value,
                        }))
                      }
                      placeholder="Date Issued"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <input
                      type="date"
                      value={newCertification.expiryDate}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          expiryDate: e.target.value,
                        }))
                      }
                      placeholder="Expiry Date"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <input
                      type="url"
                      value={newCertification.certificateUrl}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          certificateUrl: e.target.value,
                        }))
                      }
                      placeholder="Certificate URL"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900 md:col-span-2"
                    />
                    <button
                      onClick={addCertification}
                      className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#ff5722] transition-colors flex items-center justify-center gap-2 md:col-span-2"
                    >
                      <Plus size={16} />
                      Add Certification
                    </button>
                  </div>
                </div>

                {fundiProfile.certifications.length > 0 && (
                  <div className="space-y-3">
                    {fundiProfile.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="  text-gray-900">{cert.name}</h4>
                            {cert.verified && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                <CheckCircle size={12} />
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Issued by: {cert.issuedBy}
                          </p>
                          <p className="text-xs text-gray-500">
                            Issued:{" "}
                            {new Date(cert.dateIssued).toLocaleDateString()}
                            {cert.expiryDate &&
                              ` • Expires: ${new Date(
                                cert.expiryDate
                              ).toLocaleDateString()}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeCertification(index)}
                          className="ml-4 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Portfolio */}
              <div>
                <h3 className="text-lg   text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Portfolio
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Add Portfolio Item
                  </h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newPortfolioItem.title}
                      onChange={(e) =>
                        setNewPortfolioItem((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Project Title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <textarea
                      value={newPortfolioItem.description}
                      onChange={(e) =>
                        setNewPortfolioItem((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Project Description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <input
                      type="date"
                      value={newPortfolioItem.completedDate}
                      onChange={(e) =>
                        setNewPortfolioItem((prev) => ({
                          ...prev,
                          completedDate: e.target.value,
                        }))
                      }
                      placeholder="Completion Date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                    <button
                      onClick={addPortfolioItem}
                      className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#ff5722] transition-colors flex items-center justify-center gap-2 w-full"
                    >
                      <Plus size={16} />
                      Add Portfolio Item
                    </button>
                  </div>
                </div>

                {fundiProfile.portfolio.length > 0 && (
                  <div className="space-y-3">
                    {fundiProfile.portfolio.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white border rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="  text-gray-900">{item.title}</h4>
                          <button
                            onClick={() => removePortfolioItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                        {item.completedDate && (
                          <p className="text-xs text-gray-500">
                            Completed:{" "}
                            {new Date(item.completedDate).toLocaleDateString()}
                          </p>
                        )}
                        {item.images.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {item.images.map((img, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"
                              >
                                <FileText size={20} className="text-gray-500" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="text-lg   text-gray-900 mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={fundiProfile.bankDetails.accountName}
                      onChange={(e) =>
                        setFundiProfile((prev) => ({
                          ...prev,
                          bankDetails: {
                            ...prev.bankDetails,
                            accountName: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={fundiProfile.bankDetails.accountNumber}
                      onChange={(e) =>
                        setFundiProfile((prev) => ({
                          ...prev,
                          bankDetails: {
                            ...prev.bankDetails,
                            accountNumber: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={fundiProfile.bankDetails.bankName}
                      onChange={(e) =>
                        setFundiProfile((prev) => ({
                          ...prev,
                          bankDetails: {
                            ...prev.bankDetails,
                            bankName: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Number
                    </label>
                    <input
                      type="tel"
                      value={fundiProfile.bankDetails.mpesaNumber}
                      onChange={(e) =>
                        setFundiProfile((prev) => ({
                          ...prev,
                          bankDetails: {
                            ...prev.bankDetails,
                            mpesaNumber: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Save Fundi Profile Button */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  onClick={handleUpdateFundiProfile}
                  disabled={savingFundiProfile}
                  className="bg-[#FF6B35] text-white px-8 py-3 rounded-lg hover:bg-[#ff5722] transition-colors   flex items-center gap-2 disabled:opacity-50"
                >
                  {savingFundiProfile ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      <span>Saving Professional Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Save Professional Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map Modal */}
      <LocationMapModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        initialCoords={location.coordinates}
      />
    </div>
  );
}
