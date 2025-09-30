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
  X,
  AlertCircle,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Bell
} from "lucide-react";

export default function TrainerSchedule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // week, month
  const [filterStatus, setFilterStatus] = useState("all"); // all, ongoing, upcoming
  const [searchTerm, setSearchTerm] = useState(""); // search by class name
  
  // Schedule change request states
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
  const [selectedClassForChange, setSelectedClassForChange] = useState(null);
  const [changeRequests, setChangeRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [makeupSchedules, setMakeupSchedules] = useState([]);
  const [cancelledOriginalDates, setCancelledOriginalDates] = useState([]);

  useEffect(() => {
    fetchTrainerClasses();
    fetchChangeRequests();
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
        setPendingRequests(requests.filter(r => r.status === 'pending').length);
        
        // Extract makeup schedules from approved requests
        const makeups = requests
          .filter(r => r.status === 'approved' && r.makeupSchedule)
          .map(r => ({
            id: r._id,
            classId: r.class?._id,
            className: r.class?.className,
            location: r.makeupSchedule.location,
            date: r.makeupSchedule.date,
            startTime: r.makeupSchedule.startTime,
            endTime: r.makeupSchedule.endTime,
            originalDate: r.originalDate
          }));
        setMakeupSchedules(makeups);
        
        // Extract cancelled original dates (approved requests with makeup schedules)
        const cancelledDates = requests
          .filter(r => r.status === 'approved' && r.makeupSchedule)
          .map(r => ({
            classId: r.class?._id,
            className: r.class?.className,
            originalDate: r.originalDate,
            location: r.class?.location
          }));
        setCancelledOriginalDates(cancelledDates);
      } else {
        setChangeRequests([]);
        setPendingRequests(0);
        setMakeupSchedules([]);
        setCancelledOriginalDates([]);
      }
    } catch (error) {
      console.error("Error fetching change requests:", error);
      setChangeRequests([]);
      setPendingRequests(0);
      setMakeupSchedules([]);
      setCancelledOriginalDates([]);
    }
  };

  // Submit schedule change request
  const submitChangeRequest = async (requestData) => {
    try {
      const token = localStorage.getItem("token");
      
      const requestBody = {
        classId: selectedClassForChange._id,
        originalDate: requestData.originalDate,
        requestedDate: requestData.requestedDate,
        reason: requestData.reason,
        urgency: requestData.urgency
      };
      
      console.log("Submitting request data:", requestBody);
      console.log("Selected class:", selectedClassForChange);
      
      const response = await axios.post(
        `http://localhost:5000/api/trainers/schedule-change-request`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert("Yêu cầu thay đổi lịch đã được gửi! Admin sẽ xem xét và phản hồi sớm.");
        setShowChangeRequestModal(false);
        setSelectedClassForChange(null);
        fetchChangeRequests(); // Refresh requests
      }
    } catch (error) {
      console.error("Error submitting change request:", error);
      console.error("Error response:", error.response?.data);
      
      // Hiển thị thông báo lỗi chi tiết từ server
      const errorMessage = error.response?.data?.message || "Có lỗi khi gửi yêu cầu. Vui lòng thử lại.";
      alert(errorMessage);
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
    const currentDayDate = weekDates[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust for Sunday = 0
    currentDayDate.setHours(0, 0, 0, 0);
    
    // Get cancelled dates for filtering
    const cancelledOnThisDay = cancelledOriginalDates.filter(cancelled => {
      const cancelledDate = new Date(cancelled.originalDate);
      cancelledDate.setHours(0, 0, 0, 0);
      return cancelledDate.getTime() === currentDayDate.getTime();
    });

    const regularClasses = classes.filter(classItem => {
      const schedule = parseSchedule(classItem.schedule);
      if (!schedule) return false;
      
      // Check if the current week's day is within the class date range
      const classStartDate = new Date(classItem.startDate);
      const classEndDate = new Date(classItem.endDate);
      
      // Set time to start of day for accurate comparison
      classStartDate.setHours(0, 0, 0, 0);
      classEndDate.setHours(0, 0, 0, 0);
      
      // Only show class if current day is within the class duration
      if (currentDayDate < classStartDate || currentDayDate > classEndDate) {
        return false;
      }
      
      // Check if this specific class on this date is cancelled
      const isCancelledToday = cancelledOnThisDay.some(cancelled => 
        cancelled.classId === classItem._id
      );
      
      // If cancelled, don't include in regular classes (will be shown as cancelled instead)
      if (isCancelledToday) {
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

    // Get makeup schedules for this day
    const makeupClassesForDay = makeupSchedules.filter(makeup => {
      const makeupDate = new Date(makeup.date);
      makeupDate.setHours(0, 0, 0, 0);
      
      return makeupDate.getTime() === currentDayDate.getTime();
    }).map(makeup => ({
      ...makeup,
      _id: `makeup-${makeup.id}`,
      className: makeup.className,
      schedule: `${makeup.startTime}-${makeup.endTime}`,
      location: makeup.location,
      isMakeup: true,
      description: 'Lịch dạy bù'
    }));

    // Get cancelled original dates for this day (show as grey/disabled)
    const cancelledClassesForDay = cancelledOnThisDay.map(cancelled => {
      // Find the original class to get schedule info
      const originalClass = classes.find(c => c._id === cancelled.classId);
      if (!originalClass) return null;
      
      const schedule = parseSchedule(originalClass.schedule);
      if (!schedule) return null;
      
      return {
        ...originalClass,
        _id: `cancelled-${cancelled.classId}-${cancelled.originalDate}`,
        isCancelled: true,
        originalDate: cancelled.originalDate,
        description: 'Lịch đã hủy - có lịch bù'
      };
    }).filter(Boolean);

    return [...regularClasses, ...makeupClassesForDay, ...cancelledClassesForDay];
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

  // Schedule Change Request Modal Component
  const ScheduleChangeRequestModal = () => {
    const [formData, setFormData] = useState({
      originalDate: '',
      requestedDate: '',
      reason: '',
      urgency: 'medium'
    });

    if (!showChangeRequestModal || !selectedClassForChange) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Validate required fields
      if (!formData.originalDate || !formData.requestedDate || !formData.reason.trim()) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }
      
      // Validate reason length
      if (formData.reason.trim().length < 10) {
        alert("Lý do thay đổi phải có ít nhất 10 ký tự!");
        return;
      }
      
      // Validate reason length max
      if (formData.reason.trim().length > 500) {
        alert("Lý do thay đổi không được vượt quá 500 ký tự!");
        return;
      }
      
      // Validate dates
      const originalDateObj = new Date(formData.originalDate);
      const requestedDateObj = new Date(formData.requestedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (requestedDateObj < today) {
        alert("Không thể chọn ngày thay đổi trong quá khứ!");
        return;
      }
      
      if (originalDateObj.getTime() === requestedDateObj.getTime()) {
        alert("Ngày thay đổi phải khác với ngày gốc!");
        return;
      }

      // Validate requested date within class duration
      if (selectedClassForChange.startDate && selectedClassForChange.endDate) {
        const classStartDate = new Date(selectedClassForChange.startDate);
        const classEndDate = new Date(selectedClassForChange.endDate);
        
        if (requestedDateObj < classStartDate || requestedDateObj > classEndDate) {
          alert(`Ngày dạy bù phải trong khoảng thời gian lớp học (${classStartDate.toLocaleDateString('vi-VN')} - ${classEndDate.toLocaleDateString('vi-VN')})!`);
          return;
        }
      }
      
      submitChangeRequest(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Yêu cầu thay đổi lịch dạy
              </h3>
              <button
                onClick={() => {
                  setShowChangeRequestModal(false);
                  setSelectedClassForChange(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Class Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">{selectedClassForChange.className}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📍 {selectedClassForChange.location}</p>
                <p>⏰ {selectedClassForChange.schedule}</p>
                <p>👥 {selectedClassForChange.currentStudents || 0} học viên</p>
                {selectedClassForChange.startDate && selectedClassForChange.endDate && (
                  <p>📅 Thời gian lớp: {new Date(selectedClassForChange.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedClassForChange.endDate).toLocaleDateString('vi-VN')}</p>
                )}
              </div>
              {selectedClassForChange.startDate && selectedClassForChange.endDate && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Lưu ý:</strong> Ngày dạy bù chỉ có thể chọn trong khoảng thời gian lớp học đang hoạt động.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày cần thay đổi *
                </label>
                <input
                  type="date"
                  value={formData.originalDate}
                  onChange={(e) => setFormData({...formData, originalDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày mong muốn dạy bù *
                </label>
                <input
                  type="date"
                  value={formData.requestedDate}
                  onChange={(e) => setFormData({...formData, requestedDate: e.target.value})}
                  min={selectedClassForChange.startDate ? new Date(selectedClassForChange.startDate).toISOString().split('T')[0] : undefined}
                  max={selectedClassForChange.endDate ? new Date(selectedClassForChange.endDate).toISOString().split('T')[0] : undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                {selectedClassForChange.startDate && selectedClassForChange.endDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Chỉ có thể chọn từ {new Date(selectedClassForChange.startDate).toLocaleDateString('vi-VN')} đến {new Date(selectedClassForChange.endDate).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ khẩn cấp
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Thấp - Có thể linh hoạt</option>
                  <option value="medium">Bình thường</option>
                  <option value="high">Cao - Cần xử lý sớm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do thay đổi *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Ví dụ: Có việc đột xuất, bệnh, lịch cá nhân..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangeRequestModal(false);
                    setSelectedClassForChange(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Class card component
  const ClassCard = ({ classItem }) => {
    // Special handling for cancelled classes (grey)
    if (classItem.isCancelled) {
      const schedule = parseSchedule(classItem.schedule);
      if (!schedule) return null;
      
      return (
        <div className="p-3 rounded-lg border-l-4 border-gray-400 bg-gray-50 opacity-75">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-gray-600 line-through">{classItem.className}</h4>
            <span className="text-xs text-gray-500">
              {schedule.startTime} - {schedule.endTime}
            </span>
          </div>
          
          <div className="mb-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
              Đã hủy - có lịch bù
            </span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{classItem.location}</span>
          </div>
        </div>
      );
    }

    // Special handling for makeup classes
    if (classItem.isMakeup) {
      return (
        <div className="p-3 rounded-lg border-l-4 border-orange-400 bg-orange-50 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-orange-900">{classItem.className}</h4>
            <span className="text-xs text-orange-700 font-medium">
              {classItem.schedule}
            </span>
          </div>
          
          <div className="mb-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
              Lịch dạy bù
            </span>
          </div>
          
          <div className="flex items-center text-xs text-orange-700">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{classItem.location}</span>
          </div>
        </div>
      );
    }

    // Regular class handling
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
        
        <div className="flex items-center text-xs opacity-75">
          <MapPin className="h-3 w-3 mr-1" />
          <span className="line-clamp-1">{classItem.location}</span>
        </div>
        
        {/* Schedule change request button */}
        {!isCompleted && (
          <div className="mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClassForChange(classItem);
                setShowChangeRequestModal(true);
              }}
              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors flex items-center"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Đổi lịch
            </button>
          </div>
        )}
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
              
              {/* Schedule Change Requests */}
              <button 
                onClick={() => navigate('/trainer/schedule-requests')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center relative ${
                  pendingRequests > 0 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Yêu cầu đổi lịch
                {pendingRequests > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingRequests}
                  </span>
                )}
              </button>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả lớp</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="completed">Đã kết thúc</option>
              </select>
              
              {/* Export */}
              
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
      
      {/* Schedule Change Request Modal */}
      <ScheduleChangeRequestModal />
    </div>
  );
}