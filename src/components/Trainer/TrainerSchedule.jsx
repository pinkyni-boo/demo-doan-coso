import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Global/Nav";
import ScheduleChangeRequestModal from "./ScheduleChangeRequestModal";
import ClassCard from "./ClassCard";
import MaintenanceScheduleCard from "./MaintenanceScheduleCard";
import MaintenanceLegend from "./MaintenanceLegend";
import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  MessageSquare,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

export default function TrainerSchedule() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Schedule change request states
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [selectedClassForChange, setSelectedClassForChange] = useState(null);
  const [selectedDateForChange, setSelectedDateForChange] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [makeupSchedules, setMakeupSchedules] = useState([]);
  const [cancelledOriginalDates, setCancelledOriginalDates] = useState([]);

  // Maintenance schedule states
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [showMaintenance, setShowMaintenance] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("TrainerSchedule loaded with user:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    fetchTrainerClasses();
    fetchChangeRequests();
    fetchMaintenanceSchedules();
  }, []);

  // Fetch maintenance schedules when week changes
  useEffect(() => {
    if (user) {
      fetchMaintenanceSchedules();
    }
  }, [currentWeek]);

  const fetchTrainerClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/trainers/assigned-classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClasses(response.data.classes || []);
    } catch (error) {
      console.error("Error fetching trainer classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedule change requests
  const fetchChangeRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/trainers/schedule-change-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const requests = response.data.requests || [];
        setChangeRequests(requests);
        setPendingRequests(
          requests.filter((r) => r.status === "pending").length
        );

        // Extract makeup schedules from approved requests
        const makeups = requests
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
        const cancelledDates = requests
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
      console.error("Error fetching change requests:", error);
      setChangeRequests([]);
      setPendingRequests(0);
      setMakeupSchedules([]);
      setCancelledOriginalDates([]);
    }
  };

  // Fetch maintenance schedules
  const fetchMaintenanceSchedules = async () => {
    try {
      setMaintenanceLoading(true);
      const token = localStorage.getItem("token");

      // Lấy lịch bảo trì trong khoảng thời gian hiện tại
      const weekStart = getWeekDates(currentWeek)[0];
      const weekEnd = getWeekDates(currentWeek)[6];

      const response = await axios.get(
        `http://localhost:5000/api/maintenance/trainer`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            dateFrom: weekStart.toISOString(),
            dateTo: weekEnd.toISOString(),
          },
        }
      );

      if (response.data.success) {
        setMaintenanceSchedules(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error);
      setMaintenanceSchedules([]);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const submitChangeRequest = useCallback(
    async (requestData) => {
      try {
        const token = localStorage.getItem("token");

        const requestBody = {
          classId: selectedClassForChange._id,
          originalDate: requestData.originalDate,
          requestedDate: requestData.requestedDate,
          startTime: requestData.startTime,
          endTime: requestData.endTime,
          reason: requestData.reason,
          urgency: requestData.urgency,
          className: selectedClassForChange.className,
          classSchedule: selectedClassForChange.schedule,
        };

        console.log("📤 Submitting change request:", requestBody);

        const response = await axios.post(
          `http://localhost:5000/api/trainers/schedule-change-request`,
          requestBody,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          alert("Yêu cầu thay đổi lịch đã được gửi thành công!");
          handleModalClose();
          fetchChangeRequests();
        }
      } catch (error) {
        console.error("Error submitting change request:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Có lỗi khi gửi yêu cầu. Vui lòng thử lại.";
        alert(errorMessage);
      }
    },
    [selectedClassForChange]
  );

  // Parse schedule string to get day and time
  const parseSchedule = (scheduleStr) => {
    if (!scheduleStr) return null;

    // Example: "T2,T4 - 19:00-21:00" or "Thứ 2, Thứ 4 - 19:00-21:00"
    const parts = scheduleStr.split(" - ");
    if (parts.length !== 2) return null;

    const [daysPart, timePart] = parts;
    const [startTime, endTime] = timePart.split("-");

    // Parse days
    const days = [];
    if (daysPart.includes("T2") || daysPart.includes("Thứ 2")) days.push(1); // Monday
    if (daysPart.includes("T3") || daysPart.includes("Thứ 3")) days.push(2); // Tuesday
    if (daysPart.includes("T4") || daysPart.includes("Thứ 4")) days.push(3); // Wednesday
    if (daysPart.includes("T5") || daysPart.includes("Thứ 5")) days.push(4); // Thursday
    if (daysPart.includes("T6") || daysPart.includes("Thứ 6")) days.push(5); // Friday
    if (daysPart.includes("T7") || daysPart.includes("Thứ 7")) days.push(6); // Saturday
    if (daysPart.includes("CN") || daysPart.includes("Chủ nhật")) days.push(0); // Sunday

    return { days, startTime, endTime };
  };

  // Get week dates
  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Start from Monday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }

    return week;
  };

  const weekDates = getWeekDates(currentWeek);
  const weekdays = [
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
    "Chủ Nhật",
  ];

  // Get classes for specific day
  const getClassesForDay = (dayIndex) => {
    const currentDayDate = weekDates[dayIndex === 0 ? 6 : dayIndex - 1];
    currentDayDate.setHours(0, 0, 0, 0);

    const cancelledOnThisDay = cancelledOriginalDates.filter((cancelled) => {
      const cancelledDate = new Date(cancelled.originalDate);
      cancelledDate.setHours(0, 0, 0, 0);
      return cancelledDate.getTime() === currentDayDate.getTime();
    });

    const regularClasses = classes.filter((classItem) => {
      const schedule = parseSchedule(classItem.schedule);
      if (!schedule) return false;

      const classStartDate = new Date(classItem.startDate);
      const classEndDate = new Date(classItem.endDate);
      classStartDate.setHours(0, 0, 0, 0);
      classEndDate.setHours(0, 0, 0, 0);

      if (currentDayDate < classStartDate || currentDayDate > classEndDate) {
        return false;
      }

      const isCancelledToday = cancelledOnThisDay.some(
        (cancelled) => cancelled.classId === classItem._id
      );

      if (isCancelledToday) {
        return false;
      }

      // Apply filters
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (
        filterStatus === "ongoing" &&
        (now < classStartDate || now > classEndDate)
      )
        return false;
      if (filterStatus === "upcoming" && now >= classStartDate) return false;
      if (filterStatus === "completed" && now <= classEndDate) return false;

      if (
        searchTerm &&
        !classItem.className.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      return schedule.days.includes(dayIndex);
    });

    // Get makeup classes for this day
    const makeupClassesForDay = makeupSchedules
      .filter((makeup) => {
        const makeupDate = new Date(makeup.date);
        makeupDate.setHours(0, 0, 0, 0);
        return makeupDate.getTime() === currentDayDate.getTime();
      })
      .map((makeup) => ({
        ...makeup,
        _id: `makeup-${makeup.id}`,
        className: makeup.className,
        schedule: `${makeup.startTime}-${makeup.endTime}`,
        location: makeup.location,
        isMakeup: true,
      }));

    // Get cancelled classes for this day
    const cancelledClassesForDay = cancelledOnThisDay
      .map((cancelled) => {
        const originalClass = classes.find((c) => c._id === cancelled.classId);
        if (!originalClass) return null;

        return {
          ...originalClass,
          _id: `cancelled-${cancelled.classId}-${cancelled.originalDate}`,
          isCancelled: true,
          originalDate: cancelled.originalDate,
        };
      })
      .filter(Boolean);

    return [
      ...regularClasses,
      ...makeupClassesForDay,
      ...cancelledClassesForDay,
    ];
  };

  // Get maintenance schedules for a specific day
  const getMaintenanceForDay = (dayOfWeek) => {
    if (!showMaintenance) return [];

    const weekDates = getWeekDates(currentWeek);
    const currentDayDate = weekDates[dayOfWeek === 0 ? 6 : dayOfWeek - 1]; // Adjust for Sunday = 0
    currentDayDate.setHours(0, 0, 0, 0);

    return maintenanceSchedules.filter((maintenance) => {
      const maintenanceDate = new Date(maintenance.scheduledDate);
      maintenanceDate.setHours(0, 0, 0, 0);
      return maintenanceDate.getTime() === currentDayDate.getTime();
    });
  };

  // Navigate weeks
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeek);
    prevWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeek);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeek);
    nextWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeek);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  // Handler for schedule change request
  const handleScheduleChange = (classItem, currentDate) => {
    setSelectedClassForChange(classItem);
    setSelectedDateForChange(currentDate);
    setShowChangeRequestModal(true);
  };

  // Handler for modal close
  const handleModalClose = () => {
    setShowChangeRequestModal(false);
    setSelectedClassForChange(null);
    setSelectedDateForChange(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Nav user={user} setUser={setUser} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch dạy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} setUser={setUser} />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch Dạy</h1>
                <p className="text-gray-600">
                  Quản lý thời khóa biểu các lớp học
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Search Box */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="searchClasses"
                    name="searchClasses"
                    placeholder="Tìm kiếm lớp học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                    autoComplete="off"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Schedule Change Requests */}
                <button
                  onClick={() => navigate("/trainer/schedule-requests")}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    pendingRequests > 0
                      ? "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500"
                      : "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500"
                  }`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Yêu cầu đổi lịch</span>
                  <span className="sm:hidden">Đổi lịch</span>
                  {pendingRequests > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingRequests > 99 ? "99+" : pendingRequests}
                    </span>
                  )}
                </button>

                {/* Filter */}
                <select
                  id="filterStatus"
                  name="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">Tất cả lớp</option>
                  <option value="ongoing">Đang diễn ra</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="completed">Đã kết thúc</option>
                </select>

                {/* Maintenance Toggle */}
                <button
                  onClick={() => setShowMaintenance(!showMaintenance)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors text-sm font-medium relative
                    ${
                      showMaintenance
                        ? "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }
                  `}
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
                  <span className="hidden sm:inline">Bảo trì</span>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center justify-center sm:justify-start space-x-4">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Tuần trước"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {weekDates[0].toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}{" "}
                    -{" "}
                    {weekDates[6].toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tuần{" "}
                    {Math.ceil(
                      (weekDates[0].getDate() -
                        new Date(
                          weekDates[0].getFullYear(),
                          weekDates[0].getMonth(),
                          1
                        ).getDate() +
                        1) /
                        7
                    )}
                  </p>
                </div>

                <button
                  onClick={goToNextWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Tuần sau"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={goToCurrentWeek}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tuần hiện tại
              </button>
            </div>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start">
                <Search className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-blue-700 font-medium">
                    Kết quả tìm kiếm cho "{searchTerm}"
                  </p>
                  <p className="text-blue-600 text-sm">
                    Tìm thấy{" "}
                    {
                      classes.filter((c) =>
                        c.className
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      ).length
                    }{" "}
                    lớp học phù hợp
                  </p>
                </div>
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-auto text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Đóng kết quả tìm kiếm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Weekly Schedule */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {weekdays.map((day, index) => {
                const date = weekDates[index];
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={day}
                    className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                      isToday ? "bg-blue-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {day}
                    </div>
                    <div
                      className={`text-sm mt-1 ${
                        isToday
                          ? "text-blue-600 font-semibold"
                          : "text-gray-600"
                      }`}
                    >
                      {date.getDate()}/{date.getMonth() + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Schedule Grid */}
            <div className="grid grid-cols-7 min-h-96">
              {weekdays.map((day, dayIndex) => {
                const dayClasses = getClassesForDay(
                  dayIndex + 1 === 7 ? 0 : dayIndex + 1
                ); // Adjust for Sunday = 0
                const dayMaintenance = getMaintenanceForDay(
                  dayIndex + 1 === 7 ? 0 : dayIndex + 1
                );

                return (
                  <div
                    key={day}
                    className="border-r border-gray-200 last:border-r-0 p-3 space-y-2 min-h-full"
                  >
                    {dayClasses.length === 0 && dayMaintenance.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Không có lịch</p>
                      </div>
                    ) : (
                      <>
                        {/* Classes */}
                        {dayClasses
                          .sort((a, b) => {
                            const scheduleA = parseSchedule(a.schedule);
                            const scheduleB = parseSchedule(b.schedule);
                            return (
                              scheduleA?.startTime.localeCompare(
                                scheduleB?.startTime
                              ) || 0
                            );
                          })
                          .map((classItem) => {
                            const currentDate = weekDates[dayIndex];
                            return (
                              <ClassCard
                                key={classItem._id}
                                classItem={classItem}
                                currentDate={currentDate}
                                onScheduleChange={handleScheduleChange}
                              />
                            );
                          })}

                        {/* Maintenance Schedules */}
                        {showMaintenance &&
                          dayMaintenance
                            .sort(
                              (a, b) =>
                                new Date(a.scheduledDate) -
                                new Date(b.scheduledDate)
                            )
                            .map((maintenance) => (
                              <MaintenanceScheduleCard
                                key={maintenance._id}
                                maintenance={maintenance}
                              />
                            ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {searchTerm ? `Lớp tìm thấy` : "Tổng số lớp"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchTerm
                      ? classes.filter((c) =>
                          c.className
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        ).length
                      : classes.length}
                  </p>
                  {searchTerm && (
                    <p className="text-xs text-gray-500 mt-1">
                      Từ tổng {classes.length} lớp
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {searchTerm ? `Học viên (lớp tìm thấy)` : "Tổng học viên"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(searchTerm
                      ? classes.filter((c) =>
                          c.className
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                      : classes
                    ).reduce(
                      (total, cls) => total + (cls.currentStudents || 0),
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {searchTerm ? `Giờ dạy/tuần (lọc)` : "Giờ dạy/tuần"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(searchTerm
                      ? classes.filter((c) =>
                          c.className
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        )
                      : classes
                    )
                      .reduce((total, cls) => {
                        const schedule = parseSchedule(cls.schedule);
                        if (!schedule) return total;

                        const [startHour, startMin] = schedule.startTime
                          .split(":")
                          .map(Number);
                        const [endHour, endMin] = schedule.endTime
                          .split(":")
                          .map(Number);
                        const duration =
                          endHour * 60 + endMin - (startHour * 60 + startMin);

                        return total + (duration / 60) * schedule.days.length;
                      }, 0)
                      .toFixed(1)}
                    h
                  </p>
                </div>
              </div>
            </div>

            {/* Maintenance Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Lịch bảo trì tuần này
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {maintenanceSchedules.length}
                  </p>
                  {maintenanceSchedules.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {
                        maintenanceSchedules.filter(
                          (m) =>
                            m.priority === "urgent" || m.priority === "high"
                        ).length
                      }{" "}
                      ưu tiên cao
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Legend */}
          {showMaintenance && maintenanceSchedules.length > 0 && (
            <MaintenanceLegend />
          )}
        </div>
      </div>

      {/* Schedule Change Request Modal */}
      <ScheduleChangeRequestModal
        showModal={showChangeRequestModal}
        selectedClass={selectedClassForChange}
        selectedDate={selectedDateForChange}
        onClose={handleModalClose}
        onSubmit={submitChangeRequest}
      />
    </div>
  );
}
