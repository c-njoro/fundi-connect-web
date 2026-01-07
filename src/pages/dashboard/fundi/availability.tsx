import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { userService } from "@/lib/api/services";
import {
  Loader,
  Clock,
  CheckCircle,
  XCircle,
  Save,
  Calendar as CalendarIcon,
  Sun,
  Moon,
  AlertCircle,
} from "lucide-react";

interface ScheduleDay {
  available: boolean;
  hours: {
    start: string;
    end: string;
  };
}

interface Schedule {
  monday: ScheduleDay;
  tuesday: ScheduleDay;
  wednesday: ScheduleDay;
  thursday: ScheduleDay;
  friday: ScheduleDay;
  saturday: ScheduleDay;
  sunday: ScheduleDay;
}

const DEFAULT_SCHEDULE: Schedule = {
  monday: { available: false, hours: { start: "09:00", end: "17:00" } },
  tuesday: { available: false, hours: { start: "09:00", end: "17:00" } },
  wednesday: { available: false, hours: { start: "09:00", end: "17:00" } },
  thursday: { available: false, hours: { start: "09:00", end: "17:00" } },
  friday: { available: false, hours: { start: "09:00", end: "17:00" } },
  saturday: { available: false, hours: { start: "09:00", end: "17:00" } },
  sunday: { available: false, hours: { start: "09:00", end: "17:00" } },
};

export default function FundiAvailability() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [currentStatus, setCurrentStatus] = useState<
    "available" | "busy" | "offline"
  >("offline");
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);

  // Fetch profile data
  const fetchProfile = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await userService.getProfile();

      if (response.success && response.data) {
        const fundiProfile = response.data.fundiProfile;

        if (fundiProfile?.availability) {
          // Set current status
          setCurrentStatus(
            fundiProfile.availability.currentStatus || "offline"
          );

          // Set schedule - merge with defaults to ensure all days exist
          const fetchedSchedule = fundiProfile.availability.schedule || {};
          const mergedSchedule: Schedule = { ...DEFAULT_SCHEDULE };

          Object.keys(DEFAULT_SCHEDULE).forEach((day) => {
            if (fetchedSchedule[day as keyof Schedule]) {
              mergedSchedule[day as keyof Schedule] = {
                available:
                  fetchedSchedule[day as keyof Schedule].available || false,
                hours: {
                  start:
                    fetchedSchedule[day as keyof Schedule].hours?.start ||
                    "09:00",
                  end:
                    fetchedSchedule[day as keyof Schedule].hours?.end ||
                    "17:00",
                },
              };
            }
          });

          setSchedule(mergedSchedule);
        }
      } else {
        setError(response.message || "Failed to load profile");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  // Update availability
  const handleSaveAvailability = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        availability: {
          schedule: schedule,
          currentStatus: currentStatus,
        },
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await userService.updateFundiProfile({
        schedule: payload.availability.schedule,
        currentStatus: payload.availability.currentStatus,
      });

      if (response.success) {
        setSuccessMessage("Availability updated successfully!");
        await fetchProfile();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(response.message || "Failed to update availability");
      }
    } catch (err: any) {
      console.error("Error updating availability:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update availability";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Toggle day availability
  const handleDayToggle = (day: keyof Schedule) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available,
      },
    }));
  };

  // Update time for a day
  const handleTimeChange = (
    day: keyof Schedule,
    field: "start" | "end",
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        hours: {
          ...prev[day].hours,
          [field]: value,
        },
      },
    }));
  };

  // Status helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50 border-green-200";
      case "busy":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "offline":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle size={16} className="text-green-500" />;
      case "busy":
        return <Clock size={16} className="text-orange-500" />;
      case "offline":
        return <XCircle size={16} className="text-gray-500" />;
      default:
        return <XCircle size={16} className="text-gray-500" />;
    }
  };

  // Set all days available/unavailable
  const setAllDays = (available: boolean) => {
    const newSchedule = { ...schedule };
    Object.keys(newSchedule).forEach((day) => {
      newSchedule[day as keyof Schedule] = {
        ...newSchedule[day as keyof Schedule],
        available: available,
      };
    });
    setSchedule(newSchedule);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-[#0A2647] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            Loading availability settings...
          </p>
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
            <CalendarIcon size={32} />
            <span>Availability Settings</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage your working hours and availability status to let clients
            know when you're ready for jobs.
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

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
            <CheckCircle
              className="text-green-500 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h3 className="  text-green-800">Success</h3>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl   text-[#0A2647] mb-6">Current Status</h2>

              <div className="space-y-3">
                {/* Available Option */}
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentStatus === "available"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-green-500"></div>
                    <span className="font-medium text-gray-900">Available</span>
                  </div>
                  <input
                    type="radio"
                    name="status"
                    checked={currentStatus === "available"}
                    onChange={() => setCurrentStatus("available")}
                    className="h-5 w-5 text-green-500 focus:ring-green-500"
                  />
                </label>

                {/* Busy Option */}
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentStatus === "busy"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                    <span className="font-medium text-gray-900">Busy</span>
                  </div>
                  <input
                    type="radio"
                    name="status"
                    checked={currentStatus === "busy"}
                    onChange={() => setCurrentStatus("busy")}
                    className="h-5 w-5 text-orange-500 focus:ring-orange-500"
                  />
                </label>

                {/* Offline Option */}
                <label
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    currentStatus === "offline"
                      ? "border-gray-500 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-gray-500"></div>
                    <span className="font-medium text-gray-900">Offline</span>
                  </div>
                  <input
                    type="radio"
                    name="status"
                    checked={currentStatus === "offline"}
                    onChange={() => setCurrentStatus("offline")}
                    className="h-5 w-5 text-gray-500 focus:ring-gray-500"
                  />
                </label>
              </div>

              {/* Status Display */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Your Status
                </p>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getStatusColor(
                    currentStatus
                  )}`}
                >
                  {getStatusIcon(currentStatus)}
                  <span className="  capitalize">{currentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Schedule Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl   text-[#0A2647]">Weekly Schedule</h2>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setAllDays(true)}
                    className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                  >
                    All Available
                  </button>
                  <button
                    onClick={() => setAllDays(false)}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    All Unavailable
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {(Object.keys(schedule) as Array<keyof Schedule>).map((day) => {
                  const daySchedule = schedule[day];
                  return (
                    <div
                      key={day}
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg transition-all ${
                        daySchedule.available
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      {/* Day Checkbox */}
                      <label className="flex items-center gap-3 min-w-[120px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={daySchedule.available}
                          onChange={() => handleDayToggle(day)}
                          className="h-5 w-5 text-green-500 rounded focus:ring-green-500 cursor-pointer"
                        />
                        <span className="  capitalize text-gray-900">
                          {day}
                        </span>
                      </label>

                      {/* Time Inputs */}
                      {daySchedule.available ? (
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Sun size={18} className="text-orange-500" />
                            <input
                              type="time"
                              value={daySchedule.hours.start}
                              onChange={(e) =>
                                handleTimeChange(day, "start", e.target.value)
                              }
                              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-sm text-gray-900"
                            />
                          </div>
                          <span className="text-gray-500 font-medium">to</span>
                          <div className="flex items-center gap-2">
                            <Moon size={18} className="text-indigo-500" />
                            <input
                              type="time"
                              value={daySchedule.hours.end}
                              onChange={(e) =>
                                handleTimeChange(day, "end", e.target.value)
                              }
                              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2647] focus:border-transparent text-sm text-gray-900"
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm font-medium flex-1">
                          Not available on this day
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSaveAvailability}
            disabled={saving}
            className="bg-[#FF6B35] text-white px-8 py-4 rounded-lg hover:bg-[#ff5722] transition-all duration-200   text-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <>
                <Loader className="animate-spin h-5 w-5" />
                <span>Updating Availability...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Save Availability Settings</span>
              </>
            )}
          </button>
        </div>

        {/* Current Availability Preview */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl   text-[#0A2647] mb-6">
            Availability Preview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {(Object.keys(schedule) as Array<keyof Schedule>).map((day) => {
              const daySchedule = schedule[day];
              return (
                <div
                  key={day}
                  className={`text-center p-4 rounded-lg border-2 ${
                    daySchedule.available
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="font-semibold text-gray-900 capitalize mb-2 text-sm">
                    {day.slice(0, 3)}
                  </div>
                  {daySchedule.available ? (
                    <div className="text-xs text-green-700 space-y-1">
                      <div className=" ">{daySchedule.hours.start}</div>
                      <div className="text-gray-500">to</div>
                      <div className=" ">{daySchedule.hours.end}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 font-medium">
                      Unavailable
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
