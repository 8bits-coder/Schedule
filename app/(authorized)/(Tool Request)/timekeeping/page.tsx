"use client";

import { X, MapPin, Coffee } from "lucide-react";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type LunchBreak = {
  id: string;
  start: Date;
  end: Date | null;
};

type LocationChange = {
  location: string;
  arrivedAt: string;
};

type TimeSession = {
  id: string;
  workDate: string;
  clockIn: string;
  clockOut: string;
  totalHours: string;
  location: string;
  locationChanges: LocationChange[];
  lunchBreaks: Array<{ start: string; end: string; total: string }>;
  clockInReasonType: "EARLY" | "LATE" | null;
  lateClockInReason: string | null;
  clockOutReasonType: "EARLY" | "LATE" | null;
  clockOutReason: string | null;
  overtimeMinutes: number;
  overtimeReason: string | null;
};

export default function TimekeepingApp() {
  const SCHEDULE_START_HOUR = 6;
  const SCHEDULE_END_HOUR = 14;
  const EIGHT_HOURS_IN_MS = 8 * 60 * 60 * 1000;

  const LOCATIONS = [
    { id: 1, name: "Atlantic Ave" },
    { id: 2, name: "DeKalb Ave" },
    { id: 3, name: "Utica Ave" },
    { id: 4, name: "Jay St" },
  ];

  const [isClocked, setIsClocked] = useState<boolean>(false);
  const [clockInDate, setClockInDate] = useState<Date | null>(null);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentLocation, setCurrentLocation] = useState<string>(LOCATIONS[0]?.name ?? "");
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [locationInput, setLocationInput] = useState<string>(LOCATIONS[0]?.name ?? "");
  const [isOnLunch, setIsOnLunch] = useState<boolean>(false);
  const [currentLunchBreaks, setCurrentLunchBreaks] = useState<LunchBreak[]>([]);
  const [currentSessionLocationChanges, setCurrentSessionLocationChanges] = useState<LocationChange[]>([]);
  const [pendingArrivalLocation, setPendingArrivalLocation] = useState<string | null>(null);
  const [currentLateClockInReason, setCurrentLateClockInReason] = useState<string | null>(null);
  const [showClockOnModal, setShowClockOnModal] = useState<boolean>(false);
  const [clockOnLocationInput, setClockOnLocationInput] = useState<string>(LOCATIONS[0]?.name ?? "");
  const [clockOnReasonInput, setClockOnReasonInput] = useState<string>("");
  const [pendingClockOnAt, setPendingClockOnAt] = useState<Date | null>(null);
  const [showClockOutReasonModal, setShowClockOutReasonModal] = useState<boolean>(false);
  const [clockOutReasonInput, setClockOutReasonInput] = useState<string>("");
  const [pendingClockOutAt, setPendingClockOutAt] = useState<Date | null>(null);
  const [pendingClockOutType, setPendingClockOutType] = useState<"EARLY" | "LATE" | null>(null);
  const [showOvertimeModal, setShowOvertimeModal] = useState<boolean>(false);
  const [overtimeReasonInput, setOvertimeReasonInput] = useState<string>("");
  const [pendingOvertimeMinutes, setPendingOvertimeMinutes] = useState<number>(0);
  const [pendingOvertimeSessionId, setPendingOvertimeSessionId] = useState<string | null>(null);
  const [timeSessions, setTimeSessions] = useState<TimeSession[]>([]);

  const getTodayAt = (hour: number, minute = 0) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (durationMs: number) => {
    const totalMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const calculateLunchDurationMs = (lunchBreaks: LunchBreak[], shiftEnd: Date) => {
    return lunchBreaks.reduce((acc, lunchBreak) => {
      const end = lunchBreak.end ?? shiftEnd;
      return acc + Math.max(0, end.getTime() - lunchBreak.start.getTime());
    }, 0);
  };

  const scheduledStart = getTodayAt(SCHEDULE_START_HOUR);
  const scheduledEnd = getTodayAt(SCHEDULE_END_HOUR);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const performClockOn = (clockAt: Date, firstLocation: string, lateReason: string | null) => {
    const now = clockAt.toLocaleTimeString();
    setIsClocked(true);
    setClockInDate(clockAt);
    setClockInTime(now);
    setClockOutTime(null);
    setCurrentLocation(firstLocation);
    setIsOnLunch(false);
    setCurrentLunchBreaks([]);
    setCurrentLateClockInReason(lateReason);
    setPendingArrivalLocation(null);
    setCurrentSessionLocationChanges([{ location: firstLocation, arrivedAt: now }]);
  };

  const performClockOff = (
    clockAt: Date,
    clockOutReason: string | null,
    clockOutReasonType: "EARLY" | "LATE" | null,
  ) => {
    if (!isClocked || !clockInTime || !clockInDate) {
      return;
    }

    const now = clockAt.toLocaleTimeString();
    const closedLunchBreaks = currentLunchBreaks.map((lunchBreak) => ({
      ...lunchBreak,
      end: lunchBreak.end ?? clockAt,
    }));
    const grossWorkedMs = clockAt.getTime() - clockInDate.getTime();
    const lunchDurationMs = calculateLunchDurationMs(closedLunchBreaks, clockAt);
    const workedMs = grossWorkedMs - lunchDurationMs;
    setClockOutTime(now);
    setIsClocked(false);
    setIsOnLunch(false);
    const sessionId = crypto.randomUUID();
    const sessionLocationChanges = currentSessionLocationChanges.length
      ? currentSessionLocationChanges
      : [{ location: currentLocation, arrivedAt: clockInTime }];

    setTimeSessions((prevSessions) => [
      ...prevSessions,
      {
        id: sessionId,
        workDate: clockInDate.toLocaleDateString(),
        clockIn: clockInTime,
        clockOut: now,
        totalHours: formatDuration(workedMs),
        location: sessionLocationChanges[0]?.location ?? currentLocation,
        locationChanges: sessionLocationChanges,
        lunchBreaks: closedLunchBreaks.map((lunchBreak) => ({
          start: lunchBreak.start.toLocaleTimeString(),
          end: (lunchBreak.end ?? clockAt).toLocaleTimeString(),
          total: formatDuration((lunchBreak.end ?? clockAt).getTime() - lunchBreak.start.getTime()),
        })),
        clockInReasonType: currentLateClockInReason ? "LATE" : null,
        lateClockInReason: currentLateClockInReason,
        clockOutReasonType,
        clockOutReason,
        overtimeMinutes: workedMs > EIGHT_HOURS_IN_MS ? Math.round((workedMs - EIGHT_HOURS_IN_MS) / (1000 * 60)) : 0,
        overtimeReason: null,
      },
    ]);
    setClockInTime(null);
    setClockInDate(null);
    setCurrentLunchBreaks([]);
    setCurrentSessionLocationChanges([]);
    setPendingArrivalLocation(null);
    setCurrentLateClockInReason(null);

    if (workedMs > EIGHT_HOURS_IN_MS) {
      setPendingOvertimeMinutes(Math.round((workedMs - EIGHT_HOURS_IN_MS) / (1000 * 60)));
      setPendingOvertimeSessionId(sessionId);
      setShowOvertimeModal(true);
    }
  };

  const handleClockOn = () => {
    if (isClocked) {
      return;
    }

    setPendingClockOnAt(new Date());
    setClockOnLocationInput(currentLocation);
    setClockOnReasonInput("");
    setShowClockOnModal(true);
  };

  const handleClockOff = () => {
    const now = new Date();

    if (!isClocked || !clockInTime) {
      return;
    }

    if (now < scheduledEnd) {
      setPendingClockOutAt(now);
      setPendingClockOutType("EARLY");
      setClockOutReasonInput("");
      setShowClockOutReasonModal(true);
      return;
    }

    if (now > scheduledEnd) {
      setPendingClockOutAt(now);
      setPendingClockOutType("LATE");
      setClockOutReasonInput("");
      setShowClockOutReasonModal(true);
      return;
    }

    performClockOff(now, null, null);
  };

  const handleClockOnSubmit = () => {
    if (!pendingClockOnAt) {
      return;
    }

    const selectedLocation = clockOnLocationInput.trim();
    if (!selectedLocation) {
      return;
    }

    const isLateClockIn = pendingClockOnAt > scheduledStart;
    const normalizedReason = clockOnReasonInput.trim();

    if (isLateClockIn && !normalizedReason) {
      return;
    }

    performClockOn(pendingClockOnAt, selectedLocation, isLateClockIn ? normalizedReason : null);
    setShowClockOnModal(false);
    setClockOnReasonInput("");
    setPendingClockOnAt(null);
  };

  const handleCancelClockOnModal = () => {
    setShowClockOnModal(false);
    setClockOnReasonInput("");
    setPendingClockOnAt(null);
  };

  const handleClockOutReasonSubmit = () => {
    if (!pendingClockOutAt || !pendingClockOutType || !clockOutReasonInput.trim()) {
      return;
    }

    performClockOff(pendingClockOutAt, clockOutReasonInput.trim(), pendingClockOutType);
    setShowClockOutReasonModal(false);
    setClockOutReasonInput("");
    setPendingClockOutAt(null);
    setPendingClockOutType(null);
  };

  const handleCancelClockOutReasonModal = () => {
    setShowClockOutReasonModal(false);
    setClockOutReasonInput("");
    setPendingClockOutAt(null);
    setPendingClockOutType(null);
  };

  const handleOvertimeSubmit = () => {
    if (!overtimeReasonInput.trim() || pendingOvertimeMinutes <= 0 || !pendingOvertimeSessionId) {
      return;
    }

    setTimeSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === pendingOvertimeSessionId
          ? {
              ...session,
              overtimeReason: overtimeReasonInput.trim(),
            }
          : session,
      ),
    );

    setOvertimeReasonInput("");
    setPendingOvertimeMinutes(0);
    setPendingOvertimeSessionId(null);
    setShowOvertimeModal(false);
  };

  const handleCancelOvertimeModal = () => {
    setOvertimeReasonInput("");
    setPendingOvertimeMinutes(0);
    setPendingOvertimeSessionId(null);
    setShowOvertimeModal(false);
  };

  const handleLocationChange = () => {
    const nextLocation = locationInput.trim() || currentLocation;
    if (isClocked && nextLocation !== currentLocation) {
      setPendingArrivalLocation(nextLocation);
    } else {
      setCurrentLocation(nextLocation);
    }
    setShowLocationModal(false);
  };

  const handleLocationArrival = () => {
    if (!isClocked || !pendingArrivalLocation) {
      return;
    }

    const now = new Date().toLocaleTimeString();
    setCurrentLocation(pendingArrivalLocation);
    setCurrentSessionLocationChanges((prevLocations) => {
      if (prevLocations[prevLocations.length - 1]?.location === pendingArrivalLocation) {
        return prevLocations;
      }
      return [...prevLocations, { location: pendingArrivalLocation, arrivedAt: now }];
    });
    setPendingArrivalLocation(null);
  };

  const handleLunchStart = () => {
    if (!isClocked || isOnLunch) {
      return;
    }

    const now = new Date();
    setCurrentLunchBreaks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        start: now,
        end: null,
      },
    ]);
    setIsOnLunch(true);
  };

  const handleLunchEnd = () => {
    if (!isClocked || !isOnLunch) {
      return;
    }

    const now = new Date();
    setCurrentLunchBreaks((prev) => {
      const updatedLunchBreaks = [...prev];
      for (let i = updatedLunchBreaks.length - 1; i >= 0; i -= 1) {
        if (!updatedLunchBreaks[i].end) {
          updatedLunchBreaks[i] = { ...updatedLunchBreaks[i], end: now };
          break;
        }
      }
      return updatedLunchBreaks;
    });
    setIsOnLunch(false);
  };

  const handleDeleteSession = (id: string) => {
    setTimeSessions(timeSessions.filter((session) => session.id !== id));
  };

  const isLateClockOn = pendingClockOnAt ? pendingClockOnAt > scheduledStart : false;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Employee Timekeeping</h1>

          {/* Scheduled Hours */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-sm text-indigo-700 font-semibold">Scheduled Work Hours</h3>
              <p className="text-2xl font-bold text-indigo-900">
                {formatTime(scheduledStart)} - {formatTime(scheduledEnd)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-indigo-700">Current Time</div>
              <div className="text-lg font-semibold text-indigo-900">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Clock Status */}
          <div
            className={`bg-linear-to-r rounded-lg p-8 mb-8 text-center ${
              isClocked ? "from-green-500 to-lime-600" : "from-red-500 to-rose-600"
            }`}>
            <div className={`text-5xl font-bold text-white mb-4 ${isClocked ? "text-green-300" : "text-red-300"}`}>
              {isClocked ? "CLOCKED IN" : "CLOCKED OUT"}
            </div>
            {/* <div className="text-xl text-white">{currentTime.toLocaleTimeString()}</div> */}
          </div>

          {/* Current Location */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-sm text-gray-600 font-semibold">Current Location</h3>
              <p className="text-2xl font-bold text-gray-800">{currentLocation}</p>
            </div>
            <button
              onClick={() => {
                setLocationInput(currentLocation);
                setShowLocationModal(true);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
              <MapPin size={20} />
              Change Location
            </button>
          </div>
          {pendingArrivalLocation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex justify-between items-center">
              <div className="text-sm text-blue-900">
                Pending arrival location: <span className="font-semibold">{pendingArrivalLocation}</span>
              </div>
              <button
                onClick={handleLocationArrival}
                disabled={!isClocked}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors">
                Arrived at Location
              </button>
            </div>
          )}

          {/* Main Controls */}
          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            <button
              onClick={handleClockOn}
              disabled={isClocked}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors">
              Clock ON
            </button>
            <button
              onClick={handleClockOff}
              disabled={!isClocked}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors">
              Clock OFF
            </button>
            <button
              onClick={handleLunchStart}
              disabled={!isClocked || isOnLunch}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
              <Coffee size={20} />
              Lunch Start
            </button>
            <button
              onClick={handleLunchEnd}
              disabled={!isClocked || !isOnLunch}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
              <Coffee size={20} />
              Lunch End
            </button>
          </div>

          {/* Lunch Activity */}
          {currentLunchBreaks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Shift Lunch Activity</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentLunchBreaks.map((lunchBreak) => (
                  <div
                    key={lunchBreak.id}
                    className="flex justify-between items-center bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div>
                      <div className="text-sm text-gray-700">Start: {lunchBreak.start.toLocaleTimeString()}</div>
                      <div className="text-sm text-gray-700">
                        End: {lunchBreak.end ? lunchBreak.end.toLocaleTimeString() : "In progress"}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full font-semibold text-sm ${lunchBreak.end ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                      {lunchBreak.end ? "Ended" : "On Lunch"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Sessions History */}
          {timeSessions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Attendance History</h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {timeSessions.map((session) => (
                  <div key={session.id} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
                    <div>
                      <span className="font-semibold text-gray-700">Work Date: {session.workDate}</span>
                      <div className="text-sm text-gray-600">Start Location: {session.location}</div>
                      {session.lunchBreaks.length > 0 && (
                        <div className="text-sm text-gray-600">
                          Lunch:{" "}
                          {session.lunchBreaks
                            .map((lunchBreak) => `${lunchBreak.start} - ${lunchBreak.end} (${lunchBreak.total})`)
                            .join(", ")}
                        </div>
                      )}
                      <div className="text-sm text-amber-700">
                        Clock-ON reason:{" "}
                        {session.clockInReasonType && session.lateClockInReason
                          ? `${session.clockInReasonType === "EARLY" ? "Early" : "Late"} - ${session.lateClockInReason}`
                          : "None"}
                      </div>
                      <div className="text-sm text-rose-700">
                        Clock-OUT reason:{" "}
                        {session.clockOutReasonType && session.clockOutReason
                          ? `${session.clockOutReasonType === "EARLY" ? "Early" : "Late"} - ${session.clockOutReason}`
                          : "None"}
                      </div>
                      {session.overtimeMinutes > 0 && session.overtimeReason && (
                        <div className="text-sm text-sky-700">
                          Overtime ({session.overtimeMinutes} minute(s)): {session.overtimeReason}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="text-sm font-mono text-indigo-600">
                        {session.clockIn} - {session.clockOut} ({session.totalHours})
                      </div>
                      <Popover>
                        <PopoverTrigger className="px-3 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold rounded-md transition-colors">
                          Locations
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-800">Location Changes</h4>
                            {session.locationChanges.map((locationChange, index) => (
                              <div
                                key={`${session.id}-${locationChange.location}-${locationChange.arrivedAt}-${index}`}
                                className="text-sm text-gray-600">
                                {index + 1}. {locationChange.location} (arrived {locationChange.arrivedAt})
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Location</h2>

            <select
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {LOCATIONS.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <button
                onClick={handleLocationChange}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
                Save
              </button>
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clock On Modal */}
      {showClockOnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Clock ON Details</h2>
            <p className="text-sm text-gray-600 mb-4">Select first work location before starting your shift.</p>
            <select
              value={clockOnLocationInput}
              onChange={(e) => setClockOnLocationInput(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {LOCATIONS.map((location) => (
                <option key={location.id} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
            {isLateClockOn && (
              <>
                <p className="text-sm text-amber-700 mb-3">
                  You are clocking in after shift start ({formatTime(scheduledStart)}). Reason is required.
                </p>
                <textarea
                  value={clockOnReasonInput}
                  onChange={(e) => setClockOnReasonInput(e.target.value)}
                  placeholder="Enter late clock-in reason"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 min-h-28 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleClockOnSubmit}
                disabled={!clockOnLocationInput.trim() || (isLateClockOn && !clockOnReasonInput.trim())}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors">
                Start Shift
              </button>
              <button
                onClick={handleCancelClockOnModal}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overtime Modal */}
      {showOvertimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Overtime Request</h2>
            <p className="text-sm text-gray-600 mb-6">
              You exceeded 8 hours for this shift by{" "}
              <span className="font-semibold">{pendingOvertimeMinutes} minute(s)</span>. Please submit a reason.
            </p>
            <textarea
              value={overtimeReasonInput}
              onChange={(e) => setOvertimeReasonInput(e.target.value)}
              placeholder="Enter overtime reason"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 min-h-28 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex gap-4">
              <button
                onClick={handleOvertimeSubmit}
                disabled={!overtimeReasonInput.trim()}
                className="flex-1 px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors">
                Submit Overtime
              </button>
              <button
                onClick={handleCancelOvertimeModal}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clock Out Reason Modal */}
      {showClockOutReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {pendingClockOutType === "EARLY" ? "Early Clock-Out" : "Late Clock-Out"} Reason
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              You are clocking out {pendingClockOutType === "EARLY" ? "before" : "after"} shift end (
              {formatTime(scheduledEnd)}). Please provide a reason.
            </p>
            <textarea
              value={clockOutReasonInput}
              onChange={(e) => setClockOutReasonInput(e.target.value)}
              placeholder="Enter clock-out reason"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 min-h-28 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex gap-4">
              <button
                onClick={handleClockOutReasonSubmit}
                disabled={!clockOutReasonInput.trim()}
                className="flex-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors">
                Submit & Clock Out
              </button>
              <button
                onClick={handleCancelClockOutReasonModal}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
