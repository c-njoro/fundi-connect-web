import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { userService } from "@/lib/api/services";
import { IUser } from "@/types/UserType";
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
  Upload,
  X,
  Star,
  TrendingUp
} from 'lucide-react';

export default function FundiPortfolio() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for portfolio form
  const [portfolio, setPortfolio] = useState({
    bio: '',
    experience: 0,
    services: [] as string[],
    pricing: [] as Array<{
      serviceId: string;
      rateType: 'hourly' | 'fixed' | 'negotiable';
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
    portfolioItems: [] as Array<{
      title: string;
      description: string;
      images: string[];
      completedDate?: string;
    }>
  });

  // Temporary state for new items
  const [newService, setNewService] = useState('');
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuedBy: '',
    dateIssued: '',
    expiryDate: '',
    certificateUrl: '',
    verified: false
  });
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    images: [] as string[],
    completedDate: ''
  });
  const [newPricing, setNewPricing] = useState({
    serviceId: '',
    rateType: 'hourly' as 'hourly' | 'fixed' | 'negotiable',
    minRate: 0,
    maxRate: 0,
    currency: 'KES'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await userService.getProfile();
        if (data.success) {
          setProfile(data.data);
          // Initialize form with current fundi profile data
          if (data.data.fundiProfile) {
            setPortfolio({
              bio: data.data.fundiProfile.bio || '',
              experience: data.data.fundiProfile.experience || 0,
              services: data.data.fundiProfile.services || [],
              pricing: data.data.fundiProfile.pricing || [],
              certifications: data.data.fundiProfile.certifications || [],
              portfolioItems: data.data.fundiProfile.portfolio || []
            });
          }
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

  // Function to update portfolio (logic to be implemented later)
  const updatePortfolio = async () => {
    setSaving(true);
    try {
      // TODO: Implement the actual API call to update portfolio
      console.log('Updating portfolio:', portfolio);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Handle successful update
      alert('Portfolio updated successfully!');
      
    } catch (error) {
      console.error('Error updating portfolio:', error);
      alert('Failed to update portfolio');
    } finally {
      setSaving(false);
    }
  };

  // Service Management
  const addService = () => {
    if (newService.trim() && !portfolio.services.includes(newService.trim())) {
      setPortfolio(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setPortfolio(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  // Pricing Management
  const addPricing = () => {
    if (newPricing.serviceId && newPricing.minRate > 0) {
      setPortfolio(prev => ({
        ...prev,
        pricing: [...prev.pricing, { ...newPricing }]
      }));
      setNewPricing({
        serviceId: '',
        rateType: 'hourly',
        minRate: 0,
        maxRate: 0,
        currency: 'KES'
      });
    }
  };

  const removePricing = (index: number) => {
    setPortfolio(prev => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }));
  };

  // Certification Management
  const addCertification = () => {
    if (newCertification.name && newCertification.issuedBy) {
      setPortfolio(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification }]
      }));
      setNewCertification({
        name: '',
        issuedBy: '',
        dateIssued: '',
        expiryDate: '',
        certificateUrl: '',
        verified: false
      });
    }
  };

  const removeCertification = (index: number) => {
    setPortfolio(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // Portfolio Item Management
  const addPortfolioItem = () => {
    if (newPortfolioItem.title) {
      setPortfolio(prev => ({
        ...prev,
        portfolioItems: [...prev.portfolioItems, { ...newPortfolioItem }]
      }));
      setNewPortfolioItem({
        title: '',
        description: '',
        images: [],
        completedDate: ''
      });
    }
  };

  const removePortfolioItem = (index: number) => {
    setPortfolio(prev => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <X className="h-8 w-8 text-red-500 mx-auto mb-4" />
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0A2647] flex items-center space-x-2">
            <Briefcase size={24} />
            <span>Portfolio & Services</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Update your professional information, services, and showcase your work to attract more clients.
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A2647] mb-4 flex items-center space-x-2">
              <User size={20} />
              <span>Basic Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio
                </label>
                <textarea
                  value={portfolio.bio}
                  onChange={(e) => setPortfolio(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                  placeholder="Tell clients about your skills, experience, and what makes you a great fundi..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {portfolio.bio.length}/500 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <div className="flex items-center space-x-3">
                  <TrendingUp size={20} className="text-gray-500" />
                  <input
                    type="number"
                    value={portfolio.experience}
                    onChange={(e) => setPortfolio(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="50"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                  />
                  <span className="text-gray-600">years</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A2647] mb-4 flex items-center space-x-2">
              <Briefcase size={20} />
              <span>Services Offered</span>
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Service
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="e.g., Plumbing, Electrical Installation, Carpentry"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <button
                  onClick={addService}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Services List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Services ({portfolio.services.length})
              </label>
              {portfolio.services.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {portfolio.services.map((service, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full flex items-center space-x-2"
                    >
                      <span>{service}</span>
                      <button
                        onClick={() => removeService(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No services added yet.</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A2647] mb-4 flex items-center space-x-2">
              <DollarSign size={20} />
              <span>Pricing</span>
            </h2>
            
            {/* Add Pricing Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-700 mb-3">Add New Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <input
                  type="text"
                  value={newPricing.serviceId}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, serviceId: e.target.value }))}
                  placeholder="Service"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <select
                  value={newPricing.rateType}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, rateType: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                >
                  <option value="hourly">Hourly</option>
                  <option value="fixed">Fixed</option>
                  <option value="negotiable">Negotiable</option>
                </select>
                <input
                  type="number"
                  value={newPricing.minRate}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, minRate: parseInt(e.target.value) || 0 }))}
                  placeholder="Min Rate"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <input
                  type="number"
                  value={newPricing.maxRate || ''}
                  onChange={(e) => setNewPricing(prev => ({ ...prev, maxRate: parseInt(e.target.value) || undefined }))}
                  placeholder="Max Rate"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <button
                  onClick={addPricing}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Pricing List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Pricing ({portfolio.pricing.length})
              </label>
              {portfolio.pricing.length > 0 ? (
                <div className="space-y-3">
                  {portfolio.pricing.map((price, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{price.serviceId}</div>
                        <div className="text-sm text-gray-600 capitalize">{price.rateType}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          KSh {price.minRate}
                          {price.maxRate && ` - KSh ${price.maxRate}`}
                        </div>
                        <div className="text-sm text-gray-500">{price.currency}</div>
                      </div>
                      <button
                        onClick={() => removePricing(index)}
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No pricing information added yet.</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A2647] mb-4 flex items-center space-x-2">
              <Award size={20} />
              <span>Certifications</span>
            </h2>
            
            {/* Add Certification Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-700 mb-3">Add New Certification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Certification Name"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <input
                  type="text"
                  value={newCertification.issuedBy}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, issuedBy: e.target.value }))}
                  placeholder="Issued By"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <input
                  type="date"
                  value={newCertification.dateIssued}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, dateIssued: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <input
                  type="date"
                  value={newCertification.expiryDate}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, expiryDate: e.target.value }))}
                  placeholder="Expiry Date (Optional)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <input
                  type="text"
                  value={newCertification.certificateUrl}
                  onChange={(e) => setNewCertification(prev => ({ ...prev, certificateUrl: e.target.value }))}
                  placeholder="Certificate URL"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700 md:col-span-2"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newCertification.verified}
                    onChange={(e) => setNewCertification(prev => ({ ...prev, verified: e.target.checked }))}
                    className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <label className="text-sm text-gray-700">Verified</label>
                </div>
                <button
                  onClick={addCertification}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Certification</span>
                </button>
              </div>
            </div>

            {/* Certifications List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Certifications ({portfolio.certifications.length})
              </label>
              {portfolio.certifications.length > 0 ? (
                <div className="space-y-3">
                  {portfolio.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{cert.name}</span>
                          {cert.verified && <Star size={14} className="text-yellow-500 fill-current" />}
                        </div>
                        <div className="text-sm text-gray-600">Issued by: {cert.issuedBy}</div>
                        <div className="text-xs text-gray-500">
                          Issued: {new Date(cert.dateIssued).toLocaleDateString()}
                          {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                        </div>
                      </div>
                      <button
                        onClick={() => removeCertification(index)}
                        className="ml-4 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No certifications added yet.</p>
              )}
            </div>
          </div>

          {/* Portfolio Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#0A2647] mb-4 flex items-center space-x-2">
              <FileText size={20} />
              <span>Portfolio Projects</span>
            </h2>
            
            {/* Add Portfolio Item Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-700 mb-3">Add New Portfolio Item</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newPortfolioItem.title}
                  onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Project Title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <textarea
                  value={newPortfolioItem.description}
                  onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Project Description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={newPortfolioItem.completedDate}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, completedDate: e.target.value }))}
                    placeholder="Completion Date"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#0A2647] focus:border-blue-500 text-gray-700"
                  />
                  <button
                    onClick={addPortfolioItem}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add to Portfolio</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Portfolio Items List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Portfolio ({portfolio.portfolioItems.length})
              </label>
              {portfolio.portfolioItems.length > 0 ? (
                <div className="space-y-4">
                  {portfolio.portfolioItems.map((item, index) => (
                    <div key={index} className="flex items-start justify-between p-4 bg-white border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                        )}
                        {item.completedDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Completed: {new Date(item.completedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removePortfolioItem(index)}
                        className="ml-4 text-red-500 hover:text-red-700 mt-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No portfolio items added yet.</p>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={updatePortfolio}
              disabled={saving}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Portfolio</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}