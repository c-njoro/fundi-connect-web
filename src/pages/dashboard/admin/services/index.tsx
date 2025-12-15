import { serviceService } from "@/lib/api/services";
import { useEffect, useState } from "react";
import { IService } from "@/types/ServiceTypes";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Search,
  Filter,
  Loader,
  X,
  Save,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { set } from "mongoose";
import toast from "react-hot-toast";
import { error } from "console";

export default function AdminServices() {
  const [allServices, setAllServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);

  // Form state for add/edit
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "",
    description: "",
    icon: "",
    isActive: true,
    subServices: [
      {
        name: "",
        description: "",
        estimatedDuration: 60,
        suggestedPrice: {
          min: 0,
          max: 0,
          currency: "KES",
        },
      },
    ],
  });

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceService.getAllServices();
      if (response.success) {
        setAllServices(response.data);
      } else {
        setError(response.message || "Failed to fetch services.");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setError("An error occurred while fetching services.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services based on search and category
  const filteredServices = allServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [
    "all",
    ...new Set(allServices.map((service) => service.category)),
  ];

  // Modal handlers
  const handleAddService = () => {
    setServiceForm({
      name: "",
      category: "",
      description: "",
      icon: "",
      isActive: true,
      subServices: [
        {
          name: "",
          description: "",
          estimatedDuration: 60,
          suggestedPrice: {
            min: 0,
            max: 0,
            currency: "KES",
          },
        },
      ],
    });
    setShowAddModal(true);
  };

  const handleEditService = (service: IService) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name ?? "",
      category: service.category ?? "",
      description: service.description ?? "",
      icon: service.icon ?? "",
      isActive: service.isActive,
      subServices:
        service.subServices?.map((sub) => ({
          name: sub.name ?? "",
          description: sub.description ?? "",
          estimatedDuration: sub.estimatedDuration ?? 60,
          suggestedPrice: {
            min: sub.suggestedPrice.min ?? 0,
            max: sub.suggestedPrice.max ?? 0,
            currency: sub.suggestedPrice.currency ?? "KES",
          },
        })) ?? [],
    });
    setShowEditModal(true);
  };

  const handleSaveService = async (isEdit: boolean) => {
    setModalLoading(true);
    try {
      if (isEdit && selectedService) {
        const response = await serviceService.updateService(
          selectedService._id.toString(),
          serviceForm
        );

        if (response.success) {
          console.log("Service updated:", response.data);
          setSuccessMessage("Service updated successfully!");
          toast.success("Service updated successfully!");
          setShowEditModal(false);
          fetchServices();
          return;
        }

        console.log("Update failed:", response.message);
        setErrorMessage(response.message || "Update service failed");
        toast.error("Update service failed");
        return;
      }

      const response = await serviceService.createService(serviceForm);

      if (response.success) {
        console.log("Service created:", response.data);
        setSuccessMessage("Service added successfully!");
        toast.success("Service added successfully!");
        setShowAddModal(false);
        fetchServices();
        return;
      }

      console.log("Creation failed:", response.message);
      setErrorMessage(response.message || "Add service failed");
      toast.error("Add service failed");
    } catch (error) {
      console.error("Error saving service:", error);
      alert(`Failed to ${isEdit ? "update" : "add"} service`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this service? This action cannot be undone."
      )
    ) {
      try {
        // TODO: Implement the actual API call
        console.log("Deleting service:", serviceId);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Refresh services after delete
        await fetchServices();

        alert("Service deleted successfully!");
      } catch (error) {
        console.error("Error deleting service:", error);
        alert("Failed to delete service");
      }
    }
  };

  // Sub-service form handlers
  const addSubService = () => {
    setServiceForm((prev) => ({
      ...prev,
      subServices: [
        ...prev.subServices,
        {
          name: "",
          description: "",
          estimatedDuration: 60,
          suggestedPrice: {
            min: 0,
            max: 0,
            currency: "KES",
          },
        },
      ],
    }));
  };

  const removeSubService = (index: number) => {
    setServiceForm((prev) => ({
      ...prev,
      subServices: prev.subServices.filter((_, i) => i !== index),
    }));
  };

  const updateSubService = (index: number, field: string, value: any) => {
    setServiceForm((prev) => ({
      ...prev,
      subServices: prev.subServices.map((sub, i) =>
        i === index ? { ...sub, [field]: value } : sub
      ),
    }));
  };

  const updateSubServicePrice = (
    index: number,
    field: "min" | "max",
    value: number
  ) => {
    setServiceForm((prev) => ({
      ...prev,
      subServices: prev.subServices.map((sub, i) =>
        i === index
          ? {
              ...sub,
              suggestedPrice: {
                ...sub.suggestedPrice,
                [field]: value,
              },
            }
          : sub
      ),
    }));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={fetchServices}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0A2647]">
                Services Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage all services and sub-services offered on the platform
              </p>
            </div>
            <button
              onClick={handleAddService}
              className="mt-4 sm:mt-0 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 font-semibold flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add New Service</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
              />
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6">
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-lg">No services found.</p>
              <p className="text-gray-400 mt-2">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first service."}
              </p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service._id.toString()}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Service Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {service.icon && (
                        <img
                          src={service.icon}
                          alt={service.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-semibold text-[#0A2647]">
                            {service.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              service.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {service.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {service.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {service.subServices?.length} sub-service
                            {service.subServices?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditService(service)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors duration-200"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteService(service._id.toString())
                        }
                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setExpandedService(
                            expandedService === service._id.toString()
                              ? null
                              : service._id.toString()
                          )
                        }
                        className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
                      >
                        {expandedService === service._id.toString() ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-services (Collapsible) */}
                {expandedService === service._id.toString() && (
                  <div className="p-6 bg-gray-50">
                    <h4 className="text-lg font-semibold text-[#0A2647] mb-4">
                      Sub-services
                    </h4>
                    <div className="grid gap-4">
                      {service.subServices?.map((subService, index) => (
                        <div
                          key={index}
                          className="bg-white p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">
                                {subService.name}
                              </h5>
                              <p className="text-gray-600 text-sm mt-1">
                                {subService.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Clock size={14} />
                                  <span>
                                    {formatDuration(
                                      subService.estimatedDuration
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <DollarSign size={14} />
                                  <span>
                                    KSh{" "}
                                    {subService.suggestedPrice.min.toLocaleString()}{" "}
                                    -{" "}
                                    {subService.suggestedPrice.max.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Service Modal */}
        {showAddModal && (
          <ServiceModal
            title="Add New Service"
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            onSave={() => handleSaveService(false)}
            onCancel={() => setShowAddModal(false)}
            loading={modalLoading}
            addSubService={addSubService}
            removeSubService={removeSubService}
            updateSubService={updateSubService}
            updateSubServicePrice={updateSubServicePrice}
          />
        )}

        {/* Edit Service Modal */}
        {showEditModal && selectedService && (
          <ServiceModal
            title="Edit Service"
            serviceForm={serviceForm}
            setServiceForm={setServiceForm}
            onSave={() => handleSaveService(true)}
            onCancel={() => setShowEditModal(false)}
            loading={modalLoading}
            addSubService={addSubService}
            removeSubService={removeSubService}
            updateSubService={updateSubService}
            updateSubServicePrice={updateSubServicePrice}
          />
        )}
      </div>
    </div>
  );
}

// Service Modal Component
function ServiceModal({
  title,
  serviceForm,
  setServiceForm,
  onSave,
  onCancel,
  loading,
  addSubService,
  removeSubService,
  updateSubService,
  updateSubServicePrice,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0A2647]">{title}</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#0A2647] mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.name}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                    placeholder="e.g., Plumbing, Electrical"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.category}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                    placeholder="e.g., Home Maintenance, Construction"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                    placeholder="Describe the service..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon URL
                  </label>
                  <input
                    type="text"
                    value={serviceForm.icon}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                    placeholder="https://example.com/icon.png"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={serviceForm.isActive}
                    onChange={(e) =>
                      setServiceForm({
                        ...serviceForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active Service
                  </label>
                </div>
              </div>
            </div>

            {/* Sub-services */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0A2647]">
                  Sub-services
                </h3>
                <button
                  type="button"
                  onClick={addSubService}
                  className="bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors duration-200 text-sm flex items-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Add Sub-service</span>
                </button>
              </div>

              <div className="space-y-4">
                {serviceForm.subServices.map(
                  (subService: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Sub-service {index + 1}
                        </h4>
                        {serviceForm.subServices.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubService(index)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1"
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={subService.name}
                            onChange={(e) =>
                              updateSubService(index, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                            placeholder="e.g., Pipe Installation, House Wiring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Duration (minutes) *
                          </label>
                          <input
                            type="number"
                            value={subService.estimatedDuration}
                            onChange={(e) =>
                              updateSubService(
                                index,
                                "estimatedDuration",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                            min="1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={subService.description}
                            onChange={(e) =>
                              updateSubService(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                            placeholder="Describe this sub-service..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Price (KES) *
                          </label>
                          <input
                            type="number"
                            value={subService.suggestedPrice.min}
                            onChange={(e) =>
                              updateSubServicePrice(
                                index,
                                "min",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Price (KES) *
                          </label>
                          <input
                            type="number"
                            value={subService.suggestedPrice.max}
                            onChange={(e) =>
                              updateSubServicePrice(
                                index,
                                "max",
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-gray-800"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors duration-200 font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Service</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
