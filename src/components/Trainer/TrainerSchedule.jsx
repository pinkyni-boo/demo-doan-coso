import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Eye,
  Search,
  X
} from "lucide-react";

export default function TrainerSchedule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // week, month
  const [filterStatus, setFilterStatus] = useState("all"); // all, ongoing, upcoming
  const [searchTerm, setSearchTerm] = useState(""); // search by class name

  useEffect(() => {
    fetchTrainerClasses();
  }, []);

  const fetchTrainerClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `http://localhost:5000/api/trainers/assigned-classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Trainer classes:", response.data);
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error("Error fetching trainer classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Parse schedule string to get day and time
  const parseSchedule = (scheduleStr) => {
    if (!scheduleStr) return null;
    
    // Example: "T2,T4 - 19:00-21:00" or "Thứ 2, Thứ 4 - 19:00-21:00"
    const parts = scheduleStr.split(' - ');
    if (parts.length !== 2) return null;
    
    const [daysPart, timePart] = parts;
    const [startTime, endTime] = timePart.split('-');
    
    // Parse days
    const days = [];
    if (daysPart.includes('T2') || daysPart.includes('Thứ 2')) days.push(1); // Monday
    if (daysPart.includes('T3') || daysPart.includes('Thứ 3')) days.push(2); // Tuesday
    if (daysPart.includes('T4') || daysPart.includes('Thứ 4')) days.push(3); // Wednesday
    if (daysPart.includes('T5') || daysPart.includes('Thứ 5')) days.push(4); // Thursday
    if (daysPart.includes('T6') || daysPart.includes('Thứ 6')) days.push(5); // Friday
    if (daysPart.includes('T7') || daysPart.includes('Thứ 7')) days.push(6); // Saturday
    if (daysPart.includes('CN') || daysPart.includes('Chủ nhật')) days.push(0); // Sunday
    
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
  const weekdays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

  // Get classes for specific day
  const getClassesForDay = (dayIndex) => {
    return classes.filter(classItem => {
      const schedule = parseSchedule(classItem.schedule);
      if (!schedule) return false;
      
      // Check if the current week's day is within the class date range
      const currentDayDate = weekDates[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust for Sunday = 0
      const classStartDate = new Date(classItem.startDate);
      const classEndDate = new Date(classItem.endDate);
      
      // Set time to start of day for accurate comparison
      currentDayDate.setHours(0, 0, 0, 0);
      classStartDate.setHours(0, 0, 0, 0);
      classEndDate.setHours(0, 0, 0, 0);
      
      // Only show class if current day is within the class duration
      if (currentDayDate < classStartDate || currentDayDate > classEndDate) {
        return false;
      }
      
      // Check filter status (for UI filtering, not date filtering)
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      if (filterStatus === "ongoing" && (now < classStartDate || now > classEndDate)) return false;
      if (filterStatus === "upcoming" && now >= classStartDate) return false;
      if (filterStatus === "completed" && now <= classEndDate) return false;
      
      // Check if class name matches search term
      if (searchTerm && !classItem.className.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Check if this day of week matches the class schedule
      return schedule.days.includes(dayIndex);
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

  // Class card component
  const ClassCard = ({ classItem }) => {
    const schedule = parseSchedule(classItem.schedule);
    if (!schedule) return null;

    const getClassStatus = () => {
      const now = new Date();
      const startDate = new Date(classItem.startDate);
      const endDate = new Date(classItem.endDate);
      
      // Set to start of day for comparison
      now.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      if (now < startDate) return "upcoming";
      if (now > endDate) return "completed";
      return "ongoing";
    };

    const getStatusColor = () => {
      const status = getClassStatus();
      switch (status) {
        case "upcoming":
          return "bg-blue-100 text-blue-800 border-blue-200";
        case "ongoing":
          return "bg-green-100 text-green-800 border-green-200";
        case "completed":
          return "bg-gray-100 text-gray-600 border-gray-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    const getStatusText = () => {
      const status = getClassStatus();
      switch (status) {
        case "upcoming":
          return "Sắp bắt đầu";
        case "ongoing":
          return "Đang diễn ra";
        case "completed":
          return "Đã kết thúc";
        default:
          return "";
      }
    };

    const isCompleted = getClassStatus() === "completed";

    return (
      <div 
        className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${getStatusColor()} ${
          isCompleted ? 'opacity-75' : ''
        }`}
        onClick={() => navigate(`/trainer/classes/${classItem._id}`)}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm line-clamp-1">{classItem.className}</h4>
          <span className="text-xs opacity-75">
            {schedule.startTime} - {schedule.endTime}
          </span>
        </div>
        
        {/* Class status and date range */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className={`px-2 py-1 rounded-full font-medium ${
              getClassStatus() === "upcoming" ? "bg-blue-200 text-blue-700" :
              getClassStatus() === "ongoing" ? "bg-green-200 text-green-700" :
              "bg-gray-200 text-gray-600"
            }`}>
              {getStatusText()}
            </span>
            <span className="opacity-75">
              {new Date(classItem.startDate).toLocaleDateString('vi-VN')} - {new Date(classItem.endDate).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
        
        <div className="space-y-1 text-xs opacity-75">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{classItem.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            <span>{classItem.currentStudents || 0}/{classItem.maxStudents} học viên</span>
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium">{classItem.service}</span>
          {!isCompleted && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/trainer/attendance/${classItem._id}`);
              }}
              className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded hover:bg-opacity-75 transition-colors"
            >
              Điểm danh
            </button>
          )}
          {isCompleted && (
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
              Đã hoàn thành
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch dạy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch Dạy</h1>
              <p className="text-gray-600">Quản lý thời khóa biểu các lớp học</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Search Box */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm lớp học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              
              
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {' '}
                  {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-600">
                  Tuần {Math.ceil((weekDates[0].getDate() - new Date(weekDates[0].getFullYear(), weekDates[0].getMonth(), 1).getDate() + 1) / 7)}
                </p>
              </div>
              
              <button
                onClick={goToNextWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <button
              onClick={goToCurrentWeek}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tuần hiện tại
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex items-center">
              <Search className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <p className="text-blue-700 font-medium">
                  Kết quả tìm kiếm cho "{searchTerm}"
                </p>
                <p className="text-blue-600 text-sm">
                  Tìm thấy {classes.filter(c => c.className.toLowerCase().includes(searchTerm.toLowerCase())).length} lớp học phù hợp
                </p>
              </div>
              <button
                onClick={() => setSearchTerm("")}
                className="ml-auto text-blue-600 hover:text-blue-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekdays.map((day, index) => {
              const date = weekDates[index];
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={day}
                  className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{day}</div>
                  <div className={`text-sm mt-1 ${
                    isToday ? 'text-blue-600 font-semibold' : 'text-gray-600'
                  }`}>
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-7 min-h-96">
            {weekdays.map((day, dayIndex) => {
              const dayClasses = getClassesForDay(dayIndex + 1 === 7 ? 0 : dayIndex + 1); // Adjust for Sunday = 0
              
              return (
                <div
                  key={day}
                  className="border-r border-gray-200 last:border-r-0 p-3 space-y-2 min-h-full"
                >
                  {dayClasses.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Không có lớp</p>
                    </div>
                  ) : (
                    dayClasses
                      .sort((a, b) => {
                        const scheduleA = parseSchedule(a.schedule);
                        const scheduleB = parseSchedule(b.schedule);
                        return scheduleA?.startTime.localeCompare(scheduleB?.startTime) || 0;
                      })
                      .map((classItem) => (
                        <ClassCard key={classItem._id} classItem={classItem} />
                      ))
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {searchTerm ? `Lớp tìm thấy` : 'Tổng số lớp'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchTerm 
                    ? classes.filter(c => c.className.toLowerCase().includes(searchTerm.toLowerCase())).length
                    : classes.length
                  }
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
                  {searchTerm ? `Học viên (lớp tìm thấy)` : 'Tổng học viên'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(searchTerm 
                    ? classes.filter(c => c.className.toLowerCase().includes(searchTerm.toLowerCase()))
                    : classes
                  ).reduce((total, cls) => total + (cls.currentStudents || 0), 0)}
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
                  {searchTerm ? `Giờ dạy/tuần (lọc)` : 'Giờ dạy/tuần'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {(searchTerm 
                    ? classes.filter(c => c.className.toLowerCase().includes(searchTerm.toLowerCase()))
                    : classes
                  ).reduce((total, cls) => {
                    const schedule = parseSchedule(cls.schedule);
                    if (!schedule) return total;
                    
                    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
                    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
                    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                    
                    return total + (duration / 60) * schedule.days.length;
                  }, 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}