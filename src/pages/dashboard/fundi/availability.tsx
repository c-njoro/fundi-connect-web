import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { userService } from "@/lib/api/services";
import { IUser, ScheduleDay } from "@/types/UserType";
import { 
  Loader,
  Clock,
  CheckCircle,
  XCircle,
  Save,
  Calendar as CalendarIcon,
  Sun,
  Moon
} from 'lucide-react';

export default function FundiAvailability() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for availability form
  const [availability, setAvailability] = useState({
    schedule: {
      monday: { available: false, hours: { start: '09:00', end: '17:00' } },
      tuesday: { available: false, hours: { start: '09:00', end: '17:00' } },
      wednesday: { available: false, hours: { start: '09:00', end: '17:00' } },
      thursday: { available: false, hours: { start: '09:00', end: '17:00' } },
      friday: { available: false, hours: { start: '09:00', end: '17:00' } },
      saturday: { available: false, hours: { start: '09:00', end: '17:00' } },
      sunday: { available: false, hours: { start: '09:00', end: '17:00' } }
    },
    currentStatus: 'offline' as 'available' | 'busy' | 'offline'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await userService.getProfile();
        if (data.success) {
          setProfile(data.data);
          // Initialize form with current availability data
          if (data.data.fundiProfile?.availability) {
            setAvailability({
              schedule: {
                monday: data.data.fundiProfile.availability.schedule?.monday || { available: false, hours: { start: '09:00', end: '17:00' } },
                tuesday: data.data.fundiProfile.availability.schedule?.tuesday || { available: false, hours: { start: '09:00', end: '17:00' } },
                wednesday: data.data.fundiProfile.availability.schedule?.wednesday || { available: false, hours: { start: '09:00', end: '17:00' } },
                thursday: data.data.fundiProfile.availability.schedule?.thursday || { available: false, hours: { start: '09:00', end: '17:00' } },
                friday: data.data.fundiProfile.availability.schedule?.friday || { available: false, hours: { start: '09:00', end: '17:00' } },
                saturday: data.data.fundiProfile.availability.schedule?.saturday || { available: false, hours: { start: '09:00', end: '17:00' } },
                sunday: data.data.fundiProfile.availability.schedule?.sunday || { available: false, hours: { start: '09:00', end: '17:00' } }
              },
              currentStatus: data.data.fundiProfile.availability.currentStatus || 'offline'
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

  // Function to update availability (logic to be implemented later)
  const updateAvailability = async () => {
    setSaving(true);
    try {
      // TODO: Implement the actual API call to update availability
      console.log('Updating availability:', availability);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Handle successful update
      alert('Availability updated successfully!');
      
    } catch (error) {
      console.error('Error updating availability:', error);
      alert('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day as keyof typeof prev.schedule],
          available: !prev.schedule[day as keyof typeof prev.schedule].available
        }
      }
    }));
  };

  const handleTimeChange = (day: string, field: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day as keyof typeof prev.schedule],
          hours: {
            ...prev.schedule[day as keyof typeof prev.schedule].hours,
            [field]: value
          }
        }
      }
    }));
  };

  const handleStatusChange = (status: 'available' | 'busy' | 'offline') => {
    setAvailability(prev => ({
      ...prev,
      currentStatus: status
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'busy':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'offline':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'busy':
        return <Clock size={16} className="text-orange-500" />;
      case 'offline':
        return <XCircle size={16} className="text-gray-500" />;
      default:
        return <XCircle size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600">Loading availability...</p>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0A2647] flex items-center space-x-2">
            <CalendarIcon size={24} />
            <span>Availability Settings</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Set your working hours and current availability status to let clients know when you're available for jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Current Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">Available</span>
                  </div>
                  <input
                    type="radio"
                    name="status"
                    checked={availability.currentStatus === 'available'}
                    onChange={() => handleStatusChange('available')}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="font-medium">Busy</span>
                  </div>
                  <input
                    type="radio"
                    name="status"
                    checked={availability.currentStatus === 'busy'}
                    onChange={() => handleStatusChange('busy')}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    <span className="font-medium">Offline</span>
                  </div>
                  <input
                    type="radio"
                    name="status"
                    checked={availability.currentStatus === 'offline'}
                    onChange={() => handleStatusChange('offline')}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Current Status Display */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Your Current Status</h3>
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full border ${getStatusColor(availability.currentStatus)}`}>
                  {getStatusIcon(availability.currentStatus)}
                  <span className="font-medium capitalize">{availability.currentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Schedule Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Weekly Schedule</h2>
              
              <div className="space-y-4">
                {Object.entries(availability.schedule).map(([day, schedule]) => (
                  <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={schedule.available}
                          onChange={() => handleDayToggle(day)}
                          className="h-4 w-4 text-orange-500 rounded focus:ring-orange-500"
                        />
                        <span className="font-medium capitalize w-20">
                          {day}
                        </span>
                      </div>
                      
                      {schedule.available && (
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex items-center space-x-2">
                            <Sun size={16} className="text-gray-500" />
                            <input
                              type="time"
                              value={schedule.hours?.start || '09:00'}
                              onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent"
                            />
                          </div>
                          <span className="text-gray-500">to</span>
                          <div className="flex items-center space-x-2">
                            <Moon size={16} className="text-gray-500" />
                            <input
                              type="time"
                              value={schedule.hours?.end || '17:00'}
                              onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {!schedule.available && (
                      <span className="text-gray-500 text-sm">Unavailable</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    const newSchedule = { ...availability.schedule };
                    Object.keys(newSchedule).forEach(day => {
                      newSchedule[day as keyof typeof newSchedule] = {
                        ...newSchedule[day as keyof typeof newSchedule],
                        available: true
                      };
                    });
                    setAvailability(prev => ({ ...prev, schedule: newSchedule }));
                  }}
                  className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                >
                  Set All Days Available
                </button>
                <button
                  onClick={() => {
                    const newSchedule = { ...availability.schedule };
                    Object.keys(newSchedule).forEach(day => {
                      newSchedule[day as keyof typeof newSchedule] = {
                        ...newSchedule[day as keyof typeof newSchedule],
                        available: false
                      };
                    });
                    setAvailability(prev => ({ ...prev, schedule: newSchedule }));
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Set All Days Unavailable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={updateAvailability}
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
                <span>Save Availability</span>
              </>
            )}
          </button>
        </div>

        {/* Current Availability Display */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#0A2647] mb-4">Current Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {Object.entries(availability.schedule).map(([day, schedule]) => (
              <div key={day} className={`text-center p-4 rounded-lg border ${
                schedule.available 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="font-medium text-gray-900 capitalize mb-2">
                  {day.slice(0, 3)}
                </div>
                {schedule.available ? (
                  <div className="text-sm text-green-700">
                    <div>{schedule.hours?.start || '09:00'}</div>
                    <div>to</div>
                    <div>{schedule.hours?.end || '17:00'}</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Unavailable</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}