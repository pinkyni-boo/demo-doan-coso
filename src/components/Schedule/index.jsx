import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Global/Nav";
import MaintenanceScheduleCard from "../Trainer/MaintenanceScheduleCard";
import MaintenanceLegend from "../Common/MaintenanceLegend";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Eye,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  BookOpen,
  User as UserIcon,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Settings,
  AlertTriangle,
  EyeOff,
} from "lucide-react";

export default function UserSchedule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);

  // Maintenance schedule states
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [showMaintenance, setShowMaintenance] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // Schedule change states
  const [scheduleChanges, setScheduleChanges] = useState([]);
  const [makeupSchedules, setMakeupSchedules] = useState([]);
  const [cancelledOriginalDates, setCancelledOriginalDates] = useState([]);

  // Session content popup states
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedSessionContent, setSelectedSessionContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    fetchUserEnrollments();
    fetchMaintenanceSchedules();
    fetchScheduleChanges();
  }, []);

  // Fetch maintenance schedules when week changes
  useEffect(() => {
    fetchMaintenanceSchedules();
    fetchScheduleChanges();
  }, [currentWeek]);

  const fetchUserEnrollments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      // Get user ID from localStorage
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData._id || userData.id;

      let enrollmentsData = [];

      try {
        // Use the working endpoint directly
        const userClassesResponse = await axios.get(
          `http://localhost:5000/api/classes/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          userClassesResponse.data &&
          Array.isArray(userClassesResponse.data)
        ) {
          // Check data format
          const firstItem = userClassesResponse.data[0];

          if (firstItem && firstItem.class) {
            // Data is already in enrollment format
            enrollmentsData = userClassesResponse.data;
          } else {
            // Convert classes format to enrollment format
            enrollmentsData = userClassesResponse.data.map((cls) => ({
              _id: cls._id,
              status:
                cls.status === "ongoing" ? "enrolled" : cls.status || "active",
              enrollmentDate: cls.enrollmentDate || cls.createdAt || new Date(),
              paymentStatus: cls.paymentStatus !== false,
              class: {
                _id: cls._id,
                className: cls.className || cls.name,
                serviceName: cls.serviceName || cls.service,
                instructorName: cls.instructorName || cls.instructor,
                location: cls.location || cls.room,
                schedule: cls.schedule,
                currentMembers: cls.currentMembers || cls.enrolledCount,
                maxMembers: cls.maxMembers || cls.capacity,
                totalSessions: cls.totalSessions || cls.sessions,
                currentSession: cls.currentSession || cls.completedSessions,
                price: cls.price || cls.fee,
                status: cls.status,
                startDate: cls.startDate,
                endDate: cls.endDate,
                description: cls.description,
              },
            }));
          }
        }
      } catch (userClassesError) {
        // Fallback endpoints
        try {
          const enrollmentsResponse = await axios.get(
            "http://localhost:5000/api/users/enrollments",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (
            enrollmentsResponse.data.success &&
            enrollmentsResponse.data.enrollments
          ) {
            enrollmentsData = enrollmentsResponse.data.enrollments;
          }
        } catch (enrollmentsError) {
          try {
            const myClassesResponse = await axios.get(
              "http://localhost:5000/api/users/my-classes",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (
              myClassesResponse.data &&
              Array.isArray(myClassesResponse.data)
            ) {
              enrollmentsData = myClassesResponse.data;
            }
          } catch (myClassesError) {
            enrollmentsData = [];
          }
        }
      }

      setEnrollments(enrollmentsData || []);
    } catch (error) {
      setError("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  // Fetch maintenance schedules
  const fetchMaintenanceSchedules = async () => {
    try {
      setMaintenanceLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setMaintenanceLoading(false);
        return;
      }

      const weekDates = getWeekDates(currentWeek);
      const startDate = weekDates[0].toISOString().split("T")[0];
      const endDate = weekDates[6].toISOString().split("T")[0];

      try {
        const response = await axios.get(
          `http://localhost:5000/api/maintenance/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              dateFrom: startDate,
              dateTo: endDate,
              status: "scheduled,in_progress",
            },
          }
        );

        if (response.data && response.data.success && response.data.data) {
          setMaintenanceSchedules(response.data.data);
        } else {
          setMaintenanceSchedules([]);
        }
      } catch (apiError) {
        // Fallback: If user endpoint doesn't work, try trainer endpoint
        if (
          apiError.response?.status === 404 ||
          apiError.response?.status === 403
        ) {
          try {
            const trainerResponse = await axios.get(
              `http://localhost:5000/api/maintenance/trainer`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                  dateFrom: startDate,
                  dateTo: endDate,
                  status: "scheduled,in_progress",
                },
              }
            );

            if (
              trainerResponse.data &&
              trainerResponse.data.success &&
              trainerResponse.data.data
            ) {
              setMaintenanceSchedules(trainerResponse.data.data);
            } else {
              setMaintenanceSchedules([]);
            }
          } catch (trainerError) {
            console.warn(
              "Both user and trainer endpoints failed, setting empty maintenance schedules"
            );
            setMaintenanceSchedules([]);
          }
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
      setMaintenanceSchedules([]);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  // Fetch schedule changes
  const fetchScheduleChanges = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const weekDates = getWeekDates(currentWeek);
      const startDate = weekDates[0].toISOString().split("T")[0];
      const endDate = weekDates[6].toISOString().split("T")[0];

      const response = await axios.get(
        `http://localhost:5000/api/classes/schedule-changes`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            dateFrom: startDate,
            dateTo: endDate,
          },
        }
      );

      if (response.data && response.data.success) {
        const changes = response.data.data || [];
        setScheduleChanges(changes);

        // Extract makeup schedules
        const makeups = changes
          .filter((r) => r.status === "approved" && r.makeupSchedule)
          .map((r) => ({
            id: r._id,
            classId: r.class?._id,
            className: r.class?.className,
            location: r.makeupSchedule.location,
            date: r.makeupSchedule.date,
            startTime: r.makeupSchedule.startTime,
            endTime: r.makeupSchedule.endTime,
            originalDate: r.originalDate,
          }));
        setMakeupSchedules(makeups);

        // Extract cancelled original dates
        const cancelledDates = changes
          .filter((r) => r.status === "approved" && r.makeupSchedule)
          .map((r) => ({
            classId: r.class?._id,
            className: r.class?.className,
            originalDate: r.originalDate,
            location: r.class?.location,
          }));
        setCancelledOriginalDates(cancelledDates);
      }
    } catch (error) {
      console.error("Error fetching schedule changes:", error);
      setScheduleChanges([]);
      setMakeupSchedules([]);
      setCancelledOriginalDates([]);
    }
  };

  const fetchSessionContent = async (classId, sessionNumber) => {
    try {
      setContentLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(
        `http://localhost:5000/api/session-content/${classId}/${sessionNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.content) {
        setSelectedSessionContent(response.data.content);
      } else {
        setSelectedSessionContent(null);
      }
    } catch (error) {
      console.error("Error fetching session content:", error);
      setSelectedSessionContent(null);
    } finally {
      setContentLoading(false);
    }
  };

  const handleViewSessionContent = async (classId, sessionNumber) => {
    setShowContentModal(true);
    await fetchSessionContent(classId, sessionNumber);
  };

  // Get week dates helper
  const getWeekDates = (weekStart) => {
    const startOfWeek = new Date(weekStart);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  // Generate automatic schedule based on class start/end dates
  const generateClassSchedule = (cls, enrollment) => {
    if (!cls.startDate || !cls.endDate || !cls.schedule) return [];

    const startDate = new Date(cls.startDate);
    const endDate = new Date(cls.endDate);
    const sessions = [];

    // Handle array schedule format
    if (Array.isArray(cls.schedule)) {
      cls.schedule.forEach((scheduleSlot) => {
        const dayOfWeek = scheduleSlot.dayOfWeek; // 0=Sunday, 1=Monday, etc.

        // Find all dates for this day of week between start and end date
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getDay() === dayOfWeek) {
            sessions.push({
              classId: cls._id,
              className: cls.className,
              date: new Date(currentDate),
              startTime: scheduleSlot.startTime,
              endTime: scheduleSlot.endTime,
              location: cls.location,
              instructor: cls.instructorName,
              status: enrollment.status,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }

    // Handle string schedule format (legacy)
    if (typeof cls.schedule === "string" && cls.schedule.trim() !== "") {
      const scheduleStr = cls.schedule.toLowerCase().trim();

      // Day patterns
      const dayPatterns = {
        1: ["t2", "monday", "mon", "thứ 2", "thu 2", "thứ hai", "thu hai"],
        2: ["t3", "tuesday", "tue", "thứ 3", "thu 3", "thứ ba", "thu ba"],
        3: ["t4", "wednesday", "wed", "thứ 4", "thu 4", "thứ tư", "thu tu"],
        4: ["t5", "thursday", "thu", "thứ 5", "thu 5", "thứ năm", "thu nam"],
        5: ["t6", "friday", "fri", "thứ 6", "thu 6", "thứ sáu", "thu sau"],
        6: ["t7", "saturday", "thứ 7", "thu 7"],
        0: ["cn", "sunday", "chủ nhật"],
      };

      // Find which days are mentioned in schedule
      const scheduledDays = [];
      Object.entries(dayPatterns).forEach(([dayNum, patterns]) => {
        if (patterns.some((pattern) => scheduleStr.includes(pattern))) {
          scheduledDays.push(parseInt(dayNum));
        }
      });

      // Extract time if present
      const timeMatch = scheduleStr.match(
        /(\d{1,2}[:\.]?\d{0,2})\s*[-–]\s*(\d{1,2}[:\.]?\d{0,2})/
      );
      const startTime = timeMatch ? timeMatch[1].replace(".", ":") : "08:00";
      const endTime = timeMatch ? timeMatch[2].replace(".", ":") : "10:00";

      // Generate sessions for each scheduled day
      scheduledDays.forEach((dayOfWeek) => {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          if (currentDate.getDay() === dayOfWeek) {
            sessions.push({
              classId: cls._id,
              className: cls.className,
              date: new Date(currentDate),
              startTime: startTime,
              endTime: endTime,
              location: cls.location,
              instructor: cls.instructorName,
              status: enrollment.status,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
    }

    // Sort sessions by date and assign session numbers
    sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
    sessions.forEach((session, index) => {
      session.sessionNumber = index + 1;
    });

    return sessions;
  };

  // Get all sessions for the current week
  const getSessionsForWeek = () => {
    const weekDates = getWeekDates(currentWeek);
    const allSessions = [];

    enrollments.forEach((enrollment) => {
      const cls = enrollment.class;
      if (!cls) return;

      const classSessions = generateClassSchedule(cls, enrollment);

      // Filter sessions for current week
      classSessions.forEach((session) => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        const isInCurrentWeek = weekDates.some((weekDate) => {
          const wd = new Date(weekDate);
          wd.setHours(0, 0, 0, 0);
          return wd.getTime() === sessionDate.getTime();
        });

        if (isInCurrentWeek) {
          allSessions.push(session);
        }
      });
    });

    return allSessions;
  };

  // Get sessions for a specific day (for calendar view)
  const getSessionsForDay = (dayIndex) => {
    const allSessions = getSessionsForWeek();
    const weekDates = getWeekDates(currentWeek);
    const targetDate = weekDates[dayIndex];
    targetDate.setHours(0, 0, 0, 0);

    // Check for cancelled sessions on this day
    const cancelledOnThisDay = cancelledOriginalDates.filter((cancelled) => {
      const cancelledDate = new Date(cancelled.originalDate);
      cancelledDate.setHours(0, 0, 0, 0);
      return cancelledDate.getTime() === targetDate.getTime();
    });

    // Filter regular sessions and exclude cancelled ones
    const regularSessions = allSessions.filter((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() !== targetDate.getTime()) {
        return false;
      }

      // Check if this session is cancelled
      const isCancelled = cancelledOnThisDay.some(
        (cancelled) => cancelled.classId === session.classId
      );

      return !isCancelled;
    });

    // Get makeup sessions for this day
    const makeupSessions = makeupSchedules
      .filter((makeup) => {
        const makeupDate = new Date(makeup.date);
        makeupDate.setHours(0, 0, 0, 0);
        return makeupDate.getTime() === targetDate.getTime();
      })
      .map((makeup) => {
        // Find the original session to get the sessionNumber
        const enrollment = enrollments.find(
          (e) => e.class?._id === makeup.classId
        );
        let sessionNumber = null;

        if (enrollment && enrollment.class) {
          const cls = enrollment.class;
          const schedule = generateClassSchedule(cls, enrollment);
          const originalSession = schedule.find((s) => {
            const sDate = new Date(s.date);
            const origDate = new Date(makeup.originalDate);
            sDate.setHours(0, 0, 0, 0);
            origDate.setHours(0, 0, 0, 0);
            return sDate.getTime() === origDate.getTime();
          });

          if (originalSession) {
            sessionNumber = originalSession.sessionNumber;
            console.log(
              `Found sessionNumber ${sessionNumber} for makeup session on ${makeup.date} (original: ${makeup.originalDate})`
            );
          } else {
            console.log(
              `Could not find original session for makeup on ${makeup.date} (original: ${makeup.originalDate})`
            );
          }
        }

        return {
          classId: makeup.classId,
          className: makeup.className,
          date: new Date(makeup.date),
          startTime: makeup.startTime,
          endTime: makeup.endTime,
          location: makeup.location,
          status: "enrolled",
          isMakeup: true,
          sessionNumber: sessionNumber,
        };
      });

    // Get cancelled sessions to display (optional - shows what was cancelled)
    const cancelledSessions = cancelledOnThisDay
      .map((cancelled) => {
        const enrollment = enrollments.find(
          (e) => e.class?._id === cancelled.classId
        );
        if (!enrollment || !enrollment.class) return null;

        const cls = enrollment.class;
        const schedule = generateClassSchedule(cls, enrollment);
        const cancelledSession = schedule.find((s) => {
          const sDate = new Date(s.date);
          sDate.setHours(0, 0, 0, 0);
          return sDate.getTime() === targetDate.getTime();
        });

        if (!cancelledSession) return null;

        return {
          ...cancelledSession,
          isCancelled: true,
        };
      })
      .filter(Boolean);

    return [...regularSessions, ...makeupSessions];
  };

  const weekDates = getWeekDates(currentWeek);
  const dayNames = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];

  // Get maintenance schedules for a specific day
  const getMaintenanceForDay = (dayIndex) => {
    if (!showMaintenance) return [];

    const currentDayDate = weekDates[dayIndex];
    currentDayDate.setHours(0, 0, 0, 0);

    return maintenanceSchedules.filter((maintenance) => {
      const maintenanceDate = new Date(maintenance.scheduledDate);
      maintenanceDate.setHours(0, 0, 0, 0);
      return maintenanceDate.getTime() === currentDayDate.getTime();
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes(":")) return timeStr;
    return timeStr + ":00";
  };

  // Session card component for calendar view
  const SessionCard = ({ session }) => {
    const today = new Date();
    const isToday = session.date.toDateString() === today.toDateString();
    const isPast = session.date < today;
    const isMakeup = session.isMakeup;

    // Makeup class styling
    if (isMakeup) {
      return (
        <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-orange-900 truncate">
                {session.className}
              </h4>
              <div className="mt-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
                  Lịch học bù
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs text-orange-700">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>

                {session.location && (
                  <div className="flex items-center text-xs text-orange-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">{session.location}</span>
                  </div>
                )}

                {session.instructor && (
                  <div className="flex items-center text-xs text-orange-700">
                    <UserIcon className="w-3 h-3 mr-1" />
                    <span className="truncate">{session.instructor}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-orange-100">
            {session.sessionNumber ? (
              <button
                onClick={() =>
                  handleViewSessionContent(
                    session.classId,
                    session.sessionNumber
                  )
                }
                className="flex items-center text-xs font-semibold px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all border bg-orange-600 text-white hover:bg-orange-700 border-orange-600"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                Nội dung
              </button>
            ) : (
              <button
                disabled
                className="flex items-center text-xs font-semibold px-3 py-1 rounded-lg shadow-md border bg-gray-400 text-white cursor-not-allowed opacity-50"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                Nội dung
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`bg-white rounded-lg p-3 border-l-4 shadow-sm hover:shadow-md transition-shadow ${
          isToday
            ? "border-l-blue-500 bg-blue-50"
            : isPast
            ? "border-l-gray-300 bg-gray-50"
            : "border-l-green-500"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4
              className={`font-medium text-sm truncate ${
                isToday
                  ? "text-blue-900"
                  : isPast
                  ? "text-gray-600"
                  : "text-gray-900"
              }`}
            >
              {session.className}
            </h4>

            <div className="mt-1 space-y-1">
              <div
                className={`flex items-center text-xs ${
                  isToday
                    ? "text-blue-700"
                    : isPast
                    ? "text-gray-500"
                    : "text-gray-600"
                }`}
              >
                <Clock className="w-3 h-3 mr-1" />
                <span>
                  {session.startTime} - {session.endTime}
                </span>
              </div>

              {session.location && (
                <div
                  className={`flex items-center text-xs ${
                    isToday
                      ? "text-blue-700"
                      : isPast
                      ? "text-gray-500"
                      : "text-gray-600"
                  }`}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate">{session.location}</span>
                </div>
              )}

              {session.instructor && (
                <div
                  className={`flex items-center text-xs ${
                    isToday
                      ? "text-blue-700"
                      : isPast
                      ? "text-gray-500"
                      : "text-gray-600"
                  }`}
                >
                  <UserIcon className="w-3 h-3 mr-1" />
                  <span className="truncate">{session.instructor}</span>
                </div>
              )}
            </div>
          </div>

          {isPast && (
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100">
          {session.sessionNumber ? (
            <button
              onClick={() =>
                handleViewSessionContent(session.classId, session.sessionNumber)
              }
              className={`flex items-center text-xs font-semibold px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all border ${
                isToday
                  ? "bg-vintage-gold text-vintage-dark hover:bg-yellow-500 border-vintage-gold"
                  : isPast
                  ? "bg-vintage-warm text-vintage-dark hover:bg-yellow-300 border-vintage-gold"
                  : "bg-vintage-gold text-vintage-dark hover:bg-yellow-500 border-vintage-gold"
              }`}
            >
              <BookOpen className="w-3 h-3 mr-1" />
              Nội dung
            </button>
          ) : (
            <button
              disabled
              className="flex items-center text-xs font-semibold px-3 py-1 rounded-lg shadow-md border bg-gray-400 text-white cursor-not-allowed opacity-50"
            >
              <BookOpen className="w-3 h-3 mr-1" />
              Nội dung
            </button>
          )}
        </div>
      </div>
    );
  };

  // Today's schedule alert
  const TodayScheduleAlert = () => {
    const today = new Date();
    const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday=0 to index=6
    const todaySessions = getSessionsForDay(todayIndex);
    const todayMaintenance = getMaintenanceForDay(todayIndex);

    if (todaySessions.length === 0 && todayMaintenance.length === 0)
      return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-blue-800 font-semibold">
            Lịch hôm nay ({today.toLocaleDateString("vi-VN")})
          </h3>
        </div>
        <div className="text-blue-700 mt-1">
          {todaySessions.length > 0 && (
            <p>
              Bạn có {todaySessions.length} buổi học hôm nay. Hãy chuẩn bị sẵn
              sàng!
            </p>
          )}
          {todayMaintenance.length > 0 && (
            <p className="flex items-center mt-1">
              <AlertTriangle className="w-4 h-4 mr-1 text-orange-600" />
              <span className="text-orange-700">
                Có {todayMaintenance.length} lịch bảo trì có thể ảnh hưởng đến
                lớp học
              </span>
            </p>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {todaySessions.map((session, index) => {
            return (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded p-3 border border-blue-100"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {session.className}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="inline-flex items-center mr-4">
                      <Clock className="w-3 h-3 mr-1" />
                      {session.startTime} - {session.endTime}
                    </span>
                    {session.location && (
                      <span className="inline-flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {session.location}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/classes/${session.classId}`)}
                  className="bg-vintage-gold hover:bg-yellow-500 text-vintage-dark text-sm font-semibold px-3 py-1 rounded-lg shadow-md hover:shadow-lg transition-all border border-vintage-gold"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav user={user} setUser={setUser} />
        <div className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải lịch tập...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} setUser={setUser} />

      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Today's schedule alert */}
          <TodayScheduleAlert />

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Lịch Tập Của Tôi
                </h1>
                <p className="text-gray-600">
                  Quản lý và theo dõi lịch tập hàng tuần của bạn
                </p>
                {enrollments.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Bạn đang tham gia {enrollments.length} lớp học
                  </p>
                )}
              </div>

              {/* Maintenance Toggle */}
              <div className="flex items-center gap-4 mt-4 lg:mt-0">
                <button
                  onClick={() => setShowMaintenance(!showMaintenance)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showMaintenance
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={
                    showMaintenance ? "Ẩn lịch bảo trì" : "Hiện lịch bảo trì"
                  }
                >
                  <Settings className="h-4 w-4" />
                  {showMaintenance ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">Lịch bảo trì</span>
                  {maintenanceSchedules.length > 0 && showMaintenance && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {maintenanceSchedules.length > 9
                        ? "9+"
                        : maintenanceSchedules.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => {
                  const newDate = new Date(currentWeek);
                  newDate.setDate(newDate.getDate() - 7);
                  setCurrentWeek(newDate);
                }}
                className="flex items-center px-4 py-2 bg-vintage-warm hover:bg-yellow-300 text-vintage-dark rounded-lg border border-vintage-gold font-semibold transition-all"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Tuần trước
              </button>

              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {weekDates[0].getDate()}/{weekDates[0].getMonth() + 1} -{" "}
                  {weekDates[6].getDate()}/{weekDates[6].getMonth() + 1}/
                  {weekDates[6].getFullYear()}
                </h2>
                <p className="text-sm text-gray-500">Tuần hiện tại</p>
              </div>

              <button
                onClick={() => {
                  const newDate = new Date(currentWeek);
                  newDate.setDate(newDate.getDate() + 7);
                  setCurrentWeek(newDate);
                }}
                className="flex items-center px-4 py-2 bg-vintage-warm hover:bg-yellow-300 text-vintage-dark rounded-lg border border-vintage-gold font-semibold transition-all"
              >
                Tuần sau
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>

            {/* Weekly Schedule Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mt-6">
              {dayNames.map((dayName, dayIndex) => {
                const daySessions = getSessionsForDay(dayIndex);
                const dayMaintenance = getMaintenanceForDay(dayIndex);
                const isToday =
                  new Date().toDateString() ===
                  weekDates[dayIndex].toDateString();

                return (
                  <div
                    key={dayIndex}
                    className={`bg-gray-50 rounded-lg p-4 min-h-[200px] ${
                      isToday ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className={`font-semibold ${
                          isToday ? "text-black-800" : "text-gray-900"
                        }`}
                      >
                        {dayName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {weekDates[dayIndex].getDate()}/
                        {weekDates[dayIndex].getMonth() + 1}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* Classes */}
                      {daySessions.length > 0 &&
                        daySessions
                          .sort((a, b) =>
                            a.startTime.localeCompare(b.startTime)
                          )
                          .map((session, sessionIndex) => (
                            <SessionCard key={sessionIndex} session={session} />
                          ))}

                      {/* Maintenance Schedules */}
                      {showMaintenance && dayMaintenance.length > 0 && (
                        <div className="space-y-2">
                          {dayMaintenance.map((maintenance, index) => (
                            <MaintenanceScheduleCard
                              key={maintenance._id || index}
                              maintenance={maintenance}
                            />
                          ))}
                        </div>
                      )}

                      {/* Empty state */}
                      {daySessions.length === 0 &&
                        (!showMaintenance || dayMaintenance.length === 0) && (
                          <div className="text-center py-8 text-gray-500">
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Không có lịch</p>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maintenance Legend */}
          {showMaintenance && maintenanceSchedules.length > 0 && (
            <div className="mt-6">
              <MaintenanceLegend />
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Session Content Modal */}
      {showContentModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">
                  Nội dung buổi học
                </h2>
              </div>
              <button
                onClick={() => setShowContentModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {contentLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải nội dung...</p>
                </div>
              ) : selectedSessionContent ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {selectedSessionContent.title}
                    </h3>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Nội dung:
                    </h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {selectedSessionContent.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">Chưa có nội dung buổi học</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Giáo viên chưa thêm nội dung cho buổi học này
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
