import { jobService, serviceService } from "@/lib/api/services";
import { IService } from "@/types/ServiceTypes";
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  Plus,
  AlertCircle,
  Loader,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Wrench,
  CreditCard,
  Upload,
  Trash2,
} from "lucide-react";

type CreateJobFormData = {
  serviceId: string;
  subService: string;
  jobDetails: {
    title: string;
    description: string;
    images: File[];
    urgency: "low" | "medium" | "high" | "emergency";
    estimatedBudget: {
      min: number;
      max: number;
      currency: string;
    };
  };
  location: {
    address: string;
    county: string;
    city: string;
    area: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    landmark: string;
  };
  scheduling: {
    preferredDate: string;
    preferredTime: string;
    flexibility: string;
  };
  payment: {
    method: "cash" | "mpesa" | "card";
    status: "pending" | "paid" | "failed";
  };
};

export default function CreateJob() {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [subServices, setSubServices] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState<CreateJobFormData>({
    serviceId: "",
    subService: "",
    jobDetails: {
      title: "",
      description: "",
      images: [],
      urgency: "medium",
      estimatedBudget: {
        min: 0,
        max: 0,
        currency: "KES",
      },
    },
    location: {
      address: "",
      county: "",
      city: "",
      area: "",
      coordinates: {
        lat: 0,
        lng: 0,
      },
      landmark: "",
    },
    scheduling: {
      preferredDate: new Date().toISOString().split("T")[0],
      preferredTime: "09:00",
      flexibility: "strict",
    },
    payment: {
      method: "mpesa",
      status: "pending",
    },
  });

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

  // Update subServices when a service is selected
  useEffect(() => {
    if (selectedService) {
      const service = services.find(
        (s) => s._id.toString() === selectedService
      );
      if (service) {
        const subs = (service.subServices || []).map((ss) => ss.name);
        setSubServices(subs);
        setFormData((prev) => ({
          ...prev,
          serviceId: selectedService,
          subService: subs[0] || "",
        }));
      }
    }
  }, [selectedService, services]);

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedService(e.target.value);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child, subChild] = name.split(".");

      setFormData((prev) => {
        const newData = { ...prev };

        if (subChild) {
          // Three levels deep (e.g., estimatedBudget.min)
          (newData[parent as keyof CreateJobFormData] as any)[child][subChild] =
            name.includes("min") ||
            name.includes("max") ||
            name.includes("lat") ||
            name.includes("lng")
              ? Number(value)
              : value;
        } else {
          // Two levels deep (e.g., jobDetails.title)
          (newData[parent as keyof CreateJobFormData] as any)[child] =
            name.includes("min") || name.includes("max")
              ? Number(value)
              : value;
        }

        return newData;
      });
    } else {
      // Top-level fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImages(true);

    // Convert FileList to array
    const newImages = Array.from(files);

    // Check total images won't exceed limit (e.g., 5)
    const totalImages = formData.jobDetails.images.length + newImages.length;
    if (totalImages > 5) {
      setCreateError("Maximum 5 images allowed");
      setUploadingImages(false);
      return;
    }

    // Add new images to form data
    setFormData((prev) => ({
      ...prev,
      jobDetails: {
        ...prev.jobDetails,
        images: [...prev.jobDetails.images, ...newImages],
      },
    }));

    // Create previews for new images
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setUploadingImages(false);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      jobDetails: {
        ...prev.jobDetails,
        images: prev.jobDetails.images.filter((_, i) => i !== index),
      },
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const createJob = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(false);
    setCreating(true);

    // Validate required fields
    if (!formData.serviceId || !formData.subService) {
      setCreateError("Please select a service and sub-service");
      setCreating(false);
      return;
    }

    // Ensure min budget is less than max budget
    if (
      formData.jobDetails.estimatedBudget.min >
      formData.jobDetails.estimatedBudget.max
    ) {
      setCreateError("Minimum budget cannot be greater than maximum budget");
      setCreating(false);
      return;
    }

    // Create FormData for file upload
    const formDataToSend = new FormData();

    // Append JSON data
    const jsonData = {
      ...formData,
      jobDetails: {
        ...formData.jobDetails,
        images: [], // We'll send images separately
      },
    };
    formDataToSend.append("data", JSON.stringify(jsonData));

    // Append image files
    formData.jobDetails.images.forEach((file, index) => {
      formDataToSend.append(`images`, file);
    });

    try {
      const response = await jobService.createJob(formDataToSend);
      console.log("Create job response:", response);
      if (response.success) {
        console.log("Job created successfully");
        setCreateSuccess(true);

        // Reset form
        setFormData({
          serviceId: "",
          subService: "",
          jobDetails: {
            title: "",
            description: "",
            images: [],
            urgency: "medium",
            estimatedBudget: {
              min: 0,
              max: 0,
              currency: "KES",
            },
          },
          location: {
            address: "",
            county: "",
            city: "",
            area: "",
            coordinates: {
              lat: 0,
              lng: 0,
            },
            landmark: "",
          },
          scheduling: {
            preferredDate: new Date().toISOString().split("T")[0],
            preferredTime: "09:00",
            flexibility: "strict",
          },
          payment: {
            method: "mpesa",
            status: "pending",
          },
        });
        setSelectedService("");
        setSubServices([]);
        setImagePreviews([]);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setCreateError(response.message || "Failed to create job");
      }
    } catch (err: any) {
      setCreateError(err.message || "An error occurred while creating job");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#0A2647] flex items-center gap-3">
                <Wrench size={32} />
                <span>Create New Job</span>
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Fill in the details to create a new service request
              </p>
            </div>
          </div>

          {/* Error Alerts */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle
                className="text-red-500 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={fetchServices}
                  className="text-red-700 hover:text-red-900 text-sm font-medium mt-1"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {createError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle
                className="text-red-500 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{createError}</p>
              </div>
            </div>
          )}

          {createSuccess && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
              <CheckCircle
                className="text-green-500 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <h3 className="font-semibold text-green-800">Success!</h3>
                <p className="text-green-700 text-sm">
                  Job created successfully. You can view it in your jobs list.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Form */}
        <form
          onSubmit={createJob}
          className="space-y-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          encType="multipart/form-data"
        >
          {/* Service Selection Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Wrench size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0A2647]">
                  Service Details
                </h2>
                <p className="text-gray-600 text-sm">
                  Select the service you need
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service
                </label>
                <div className="relative">
                  <select
                    name="serviceId"
                    value={selectedService}
                    onChange={handleServiceChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35] bg-white appearance-none"
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option
                        key={service._id.toString()}
                        value={service._id.toString()}
                      >
                        {service.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Service
                </label>
                <div className="relative">
                  <select
                    name="subService"
                    value={formData.subService}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35] bg-white appearance-none"
                    required
                    disabled={!selectedService}
                  >
                    <option value="">Select a sub-service</option>
                    {subServices.map((subService) => (
                      <option key={subService} value={subService}>
                        {subService}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0A2647]">
                  Job Details
                </h2>
                <p className="text-gray-600 text-sm">
                  Describe what you need done
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobDetails.title"
                  value={formData.jobDetails.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                  placeholder="e.g., Add two new wall sockets"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="jobDetails.description"
                  value={formData.jobDetails.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35] h-40"
                  placeholder="Describe the job in detail..."
                  required
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <ImageIcon size={20} className="text-pink-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Upload Images
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Add photos to help fundis understand the job better (Max 5
                      images)
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Image Upload Button */}
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#FF6B35] transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#ff5722] transition-colors font-medium flex items-center gap-2">
                        <Plus size={20} />
                        <span>Choose Images</span>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={
                          formData.jobDetails.images.length >= 5 ||
                          uploadingImages
                        }
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-4">
                      Upload up to 5 images (JPG, PNG, WebP)
                    </p>
                    {uploadingImages && (
                      <div className="flex items-center gap-2 mt-2">
                        <Loader className="animate-spin h-4 w-4 text-[#FF6B35]" />
                        <span className="text-sm text-gray-600">
                          Uploading...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                            Image {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency
                  </label>
                  <div className="relative">
                    <select
                      name="jobDetails.urgency"
                      value={formData.jobDetails.urgency}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35] bg-white appearance-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range (KES)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Minimum
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-500">
                          KSh
                        </div>
                        <input
                          type="number"
                          name="jobDetails.estimatedBudget.min"
                          value={formData.jobDetails.estimatedBudget.min}
                          onChange={handleInputChange}
                          className="w-full pl-14 p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Maximum
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-3 text-gray-500">
                          KSh
                        </div>
                        <input
                          type="number"
                          name="jobDetails.estimatedBudget.max"
                          value={formData.jobDetails.estimatedBudget.max}
                          onChange={handleInputChange}
                          className="w-full pl-14 p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0A2647]">
                  Location Details
                </h2>
                <p className="text-gray-600 text-sm">
                  Where should the work be done?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                  placeholder="e.g., 45 Kenyatta Avenue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  County
                </label>
                <input
                  type="text"
                  name="location.county"
                  value={formData.location.county}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                  placeholder="e.g., Nakuru"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                  placeholder="e.g., Nakuru"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area/Neighborhood
                </label>
                <input
                  type="text"
                  name="location.area"
                  value={formData.location.area}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                  placeholder="e.g., Milimani"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <input
                  type="text"
                  name="location.landmark"
                  value={formData.location.landmark}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                  placeholder="e.g., Next to Milimani Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.coordinates.lat"
                  value={formData.location.coordinates.lat}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                  placeholder="e.g., -0.3031"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude (Optional)
                </label>
                <input
                  type="number"
                  step="any"
                  name="location.coordinates.lng"
                  value={formData.location.coordinates.lng}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                  placeholder="e.g., 36.0800"
                />
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0A2647]">
                  Scheduling
                </h2>
                <p className="text-gray-600 text-sm">
                  When should the work be done?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="scheduling.preferredDate"
                    value={formData.scheduling.preferredDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="scheduling.preferredTime"
                    value={formData.scheduling.preferredTime}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flexibility
                </label>
                <div className="relative">
                  <select
                    name="scheduling.flexibility"
                    value={formData.scheduling.flexibility}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#FF6B35] bg-white appearance-none"
                  >
                    <option value="strict">Strict</option>
                    <option value="flexible">Flexible</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <CreditCard size={20} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#0A2647]">
                  Payment
                </h2>
                <p className="text-gray-600 text-sm">
                  Select your preferred payment method
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["cash", "mpesa", "card"] as const).map((method) => (
                  <label
                    key={method}
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#FF6B35] hover:bg-orange-50 transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="payment.method"
                      value={method}
                      checked={formData.payment.method === method}
                      onChange={handleInputChange}
                      className="mr-3 text-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          method === "cash"
                            ? "bg-blue-100"
                            : method === "mpesa"
                            ? "bg-green-100"
                            : "bg-indigo-100"
                        }`}
                      >
                        <DollarSign
                          size={18}
                          className={
                            method === "cash"
                              ? "text-blue-600"
                              : method === "mpesa"
                              ? "text-green-600"
                              : "text-indigo-600"
                          }
                        />
                      </div>
                      <div>
                        <span className="font-medium capitalize text-gray-900">
                          {method}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {method === "cash"
                            ? "Pay in cash on completion"
                            : method === "mpesa"
                            ? "Mobile money payment"
                            : "Card payment"}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-[#FF6B35] text-white py-4 px-6 rounded-lg hover:bg-[#ff5722] transition-colors font-semibold text-lg flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Creating Job...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Create Job</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({
                    serviceId: "",
                    subService: "",
                    jobDetails: {
                      title: "",
                      description: "",
                      images: [],
                      urgency: "medium",
                      estimatedBudget: {
                        min: 0,
                        max: 0,
                        currency: "KES",
                      },
                    },
                    location: {
                      address: "",
                      county: "",
                      city: "",
                      area: "",
                      coordinates: {
                        lat: 0,
                        lng: 0,
                      },
                      landmark: "",
                    },
                    scheduling: {
                      preferredDate: new Date().toISOString().split("T")[0],
                      preferredTime: "09:00",
                      flexibility: "strict",
                    },
                    payment: {
                      method: "mpesa",
                      status: "pending",
                    },
                  });
                  setSelectedService("");
                  setSubServices([]);
                  setImagePreviews([]);
                }}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear Form
              </button>
            </div>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-[#0A2647] to-[#1e3a5f] rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Need Help Creating Your Job?
              </h3>
              <p className="text-blue-100 text-sm">
                Contact support if you need assistance filling out this form or
                have questions about the job posting process.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white text-[#0A2647] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
