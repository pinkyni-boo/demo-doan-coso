import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Global/Nav";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Eye,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";

export default function TrainerSchedule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5000/api/trainers/assigned-classes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setClasses(response.data.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy tuần hiện tại
  const getWeekDays = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Bắt đầu từ thứ 2
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  // Khung giờ trong ngày
  const timeSlots = [
    { time: "06:00", label: "6:00 AM" },
    { time: "07:00", label: "7:00 AM" },
    { time: "08:00", label: "8:00 AM" },
    { time: "09:00", label: "9:00 AM" },
    { time: "10:00", label: "10:00 AM" },
    { time: "11:00", label: "11:00 AM" },
    { time: "12:00", label: "12:00 PM" },
    { time: "13:00", label: "1:00 PM" },
    { time: "14:00", label: "2:00 PM" },
    { time: "15:00", label: "3:00 PM" },
    { time: "16:00", label: "4:00 PM" },
    { time: "17:00", label: "5:00 PM" },
    { time: "18:00", label: "6:00 PM" },
    { time: "19:00", label: "7:00 PM" },
    { time: "20:00", label: "8:00 PM" },
    { time: "21:00", label: "9:00 PM" }
  ];

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const dayMap = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN' };

  // Lấy lớp học cho ngày và giờ cụ thể
  const getClassForTimeSlot = (dayIndex, timeSlot) => {
    const dayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1; // Chuyển đổi index (0=Thứ 2, 6=CN)
    const dayCode = dayMap[dayOfWeek];
    
    return classes.find(cls => {
      if (!cls.schedule || cls.status !== 'ongoing') return false;
      
      // Kiểm tra ngày trong tuần
      if (!cls.schedule.includes(dayCode)) return false;
      
      // Giả sử schedule format: "T2, T4 - 08:00-09:30" hoặc chỉ "T2, T4"
      // Tạm thời match với time slot (có thể cải thiện với dữ liệu thực tế)
      const scheduleText = cls.schedule.toLowerCase();
      if (scheduleText.includes(timeSlot.time.toLowerCase()) || 
          scheduleText.includes(timeSlot.time.replace(':', 'h'))) {
        return true;
      }
      
      // Nếu không có thời gian cụ thể, hiển thị ở slot 8:00 làm mặc định
      if (!scheduleText.includes(':') && timeSlot.time === "08:00") {
        return true;
      }
      
      return false;
    });
  };

  const weekDays = getWeekDays(currentWeek);

  const ClassCard = ({ classItem, compact = true }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-1 hover:bg-blue-100 transition-colors cursor-pointer">
      <div className="text-xs font-semibold text-blue-900 mb-1 truncate">
        {classItem.className}
      </div>
      <div className="text-xs text-blue-700 mb-1 truncate">
        {classItem.service}
      </div>
      <div className="flex items-center text-xs text-blue-600 mb-1">
        <MapPin className="h-3 w-3 mr-1" />
        <span className="truncate">{classItem.location}</span>
      </div>
      <div className="flex items-center text-xs text-blue-600">
        <Users className="h-3 w-3 mr-1" />
        <span>{classItem.enrolledStudents} HV</span>
      </div>
      <div className="flex gap-1 mt-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/trainer/class/${classItem._id}`);
          }}
          className="flex-1 bg-blue-600 text-white px-1 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
        >
          <Eye className="h-3 w-3" />
          Chi tiết
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/trainer/attendance/${classItem._id}`);
          }}
          className="flex-1 bg-green-600 text-white px-1 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
        >
          <CheckCircle className="h-3 w-3" />
          Điểm danh
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav user={user} setUser={setUser} />
        <div className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Nav user={user} setUser={setUser} />
      
      {/* Main Content */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Thời khóa biểu</h1>
            <p className="text-gray-600 mt-2">
              Lịch dạy theo tuần với khung giờ cụ thể
            </p>
          </div>

          {/* Week Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Tuần từ {weekDays[0].toLocaleDateString('vi-VN')} - {weekDays[6].toLocaleDateString('vi-VN')}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {weekDays[0].toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newWeek = new Date(currentWeek);
                    newWeek.setDate(newWeek.getDate() - 7);
                    setCurrentWeek(newWeek);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentWeek(new Date())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Tuần này
                </button>
                <button
                  onClick={() => {
                    const newWeek = new Date(currentWeek);
                    newWeek.setDate(newWeek.getDate() + 7);
                    setCurrentWeek(newWeek);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Timetable */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giờ
                    </th>
                    {dayNames.map((day, index) => {
                      const date = weekDays[index];
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <th 
                          key={day} 
                          className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider min-w-40 text-gray-500`}
                        >
                          <div>{day}</div>
                          <div className="text-sm font-normal text-gray-400">
                            {date.getDate()}/{date.getMonth() + 1}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <tr key={timeSlot.time} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                        <div className="text-center">
                          <div className="font-semibold">{timeSlot.time}</div>
                          <div className="text-xs text-gray-500">{timeSlot.label}</div>
                        </div>
                      </td>
                      {dayNames.map((day, dayIndex) => {
                        const classItem = getClassForTimeSlot(dayIndex, timeSlot);
                        const date = weekDays[dayIndex];
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        return (
                          <td 
                            key={`${timeSlot.time}-${day}`} 
                            className={`px-2 py-2 whitespace-nowrap text-sm text-gray-500 border-l border-gray-200`}
                            style={{ minHeight: '80px', height: '80px' }}
                          >
                            {classItem ? (
                              <ClassCard classItem={classItem} />
                            ) : (
                              <div className="h-full flex items-center justify-center text-gray-300">
                                <span className="text-xs">Trống</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ghi chú</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                <span className="text-sm text-gray-600">Có lớp học</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-50 border border-gray-200 rounded"></div>
                <span className="text-sm text-gray-600">Hôm nay</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                <span className="text-sm text-gray-600">Trống</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Lưu ý:</strong> Click vào lớp học để xem chi tiết hoặc thực hiện điểm danh. Thời gian hiển thị dựa trên dữ liệu lịch học được cấu hình.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}