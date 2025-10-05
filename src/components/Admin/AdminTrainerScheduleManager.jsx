import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar,
  Clock,
  Users,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  BookOpen
} from 'lucide-react';

const AdminTrainerScheduleManager = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerClasses, setTrainerClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Tạm thời sử dụng API users với filter role trainer
      const response = await axios.get(
        'http://localhost:5000/api/users',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Filter chỉ lấy users có role trainer
        const trainerUsers = (response.data.users || []).filter(user => user.role === 'trainer');
        setTrainers(trainerUsers);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
      // Fallback: Tạo data mẫu để test UI
      setTrainers([
        {
          _id: '1',
          fullName: 'Nguyễn Văn A',
          email: 'trainer1@gym.com',
          phone: '0901234567',
          gender: 'male',
          status: 'active',
          role: 'trainer'
        },
        {
          _id: '2',
          fullName: 'Trần Thị B',
          email: 'trainer2@gym.com',
          phone: '0901234568',
          gender: 'female',
          status: 'active',
          role: 'trainer'
        },
        {
          _id: '3',
          fullName: 'Lê Văn C',
          email: 'trainer3@gym.com',
          phone: '0901234569',
          gender: 'male',
          status: 'inactive',
          role: 'trainer'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerSchedule = async (trainerId) => {
    try {
      setScheduleLoading(true);
      const token = localStorage.getItem('token');
      
      // Tạm thời sử dụng API classes với filter trainerId
      const response = await axios.get(
        `http://localhost:5000/api/classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Filter classes theo trainerId
        const trainerClasses = (response.data.classes || []).filter(cls => cls.trainerId === trainerId);
        setTrainerClasses(trainerClasses);
      }
    } catch (error) {
      console.error('Error fetching trainer schedule:', error);
      // Fallback: Tạo data mẫu để test UI
      setTrainerClasses([
        {
          _id: 'class1',
          className: 'Yoga Cơ Bản',
          schedule: 'T2,T4 - 19:00-21:00',
          location: 'Phòng 1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          currentStudents: 15,
          maxStudents: 20,
          serviceName: 'Yoga'
        },
        {
          _id: 'class2',
          className: 'Gym Nâng Cao',
          schedule: 'T3,T6 - 18:00-20:00',
          location: 'Phòng 2',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          currentStudents: 12,
          maxStudents: 15,
          serviceName: 'Gym'
        }
      ]);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleViewSchedule = (trainer) => {
    setSelectedTrainer(trainer);
    fetchTrainerSchedule(trainer._id);
  };

  const parseSchedule = (scheduleStr) => {
    if (!scheduleStr) return null;
    
    const parts = scheduleStr.split(' - ');
    if (parts.length !== 2) return null;
    
    const [daysPart, timePart] = parts;
    const [startTime, endTime] = timePart.split('-');
    
    const days = [];
    if (daysPart.includes('T2') || daysPart.includes('Thứ 2')) days.push(1);
    if (daysPart.includes('T3') || daysPart.includes('Thứ 3')) days.push(2);
    if (daysPart.includes('T4') || daysPart.includes('Thứ 4')) days.push(3);
    if (daysPart.includes('T5') || daysPart.includes('Thứ 5')) days.push(4);
    if (daysPart.includes('T6') || daysPart.includes('Thứ 6')) days.push(5);
    if (daysPart.includes('T7') || daysPart.includes('Thứ 7')) days.push(6);
    if (daysPart.includes('CN') || daysPart.includes('Chủ nhật')) days.push(0);
    
    return { days, startTime, endTime };
  };

  const getWeekDates = (date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }
    
    return week;
  };

  const getClassesForDay = (dayIndex) => {
    return trainerClasses.filter(classItem => {
      const schedule = parseSchedule(classItem.schedule);
      if (!schedule) return false;
      
      const classStartDate = new Date(classItem.startDate);
      const classEndDate = new Date(classItem.endDate);
      const weekDates = getWeekDates(currentWeek);
      const currentDayDate = weekDates[dayIndex === 0 ? 6 : dayIndex - 1];
      
      if (currentDayDate < classStartDate || currentDayDate > classEndDate) {
        return false;
      }
      
      return schedule.days.includes(dayIndex);
    });
  };

  const filteredTrainers = trainers.filter(trainer =>
    trainer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const weekDates = getWeekDates(currentWeek);
  const weekdays = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quản lý Lịch Dạy Trainer
        </h1>
        <p className="text-gray-600">
          Xem và quản lý thời khóa biểu của tất cả trainer
        </p>
        
        {/* Thông báo backend */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Lưu ý về Backend Server
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Hiện tại đang sử dụng dữ liệu mẫu. Để sử dụng dữ liệu thật, vui lòng:
                </p>
                <ol className="mt-1 ml-4 list-decimal">
                  <li>Mở terminal trong thư mục backend</li>
                  <li>Chạy lệnh: <code className="bg-yellow-100 px-1 rounded">npm start</code></li>
                  <li>Đảm bảo server chạy trên port 5000</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!selectedTrainer ? (
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Danh sách Trainer
              </h2>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm trainer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trainers List */}
          <div className="p-6">
            {filteredTrainers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy trainer nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTrainers.map((trainer) => (
                  <div
                    key={trainer._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {trainer.fullName || 'Chưa cập nhật'}
                            </h3>
                            <p className="text-sm text-gray-500">{trainer.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <span className="w-16 text-gray-500">SĐT:</span>
                            <span>{trainer.phone || 'Chưa cập nhật'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-16 text-gray-500">Giới tính:</span>
                            <span>{trainer.gender === 'male' ? 'Nam' : trainer.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-16 text-gray-500">Trạng thái:</span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              trainer.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {trainer.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleViewSchedule(trainer)}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Xem Thời Khóa Biểu</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedTrainer(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Quay lại
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Lịch dạy của {selectedTrainer.fullName}
                  </h2>
                  <p className="text-sm text-gray-600">{selectedTrainer.email}</p>
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
                  <h3 className="font-semibold text-gray-900">
                    {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - 
                    {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </h3>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Tuần hiện tại
              </button>
            </div>
          </div>

          {/* Schedule Grid */}
          {scheduleLoading ? (
            <div className="p-6 flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div>
              {/* Days Header */}
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
                      <div className="font-semibold text-gray-900 text-sm">{day}</div>
                      <div className={`text-sm mt-1 ${
                        isToday ? 'text-blue-600 font-semibold' : 'text-gray-600'
                      }`}>
                        {date.getDate()}/{date.getMonth() + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Schedule Content */}
              <div className="grid grid-cols-7 min-h-96">
                {weekdays.map((day, dayIndex) => {
                  const dayClasses = getClassesForDay(dayIndex + 1 === 7 ? 0 : dayIndex + 1);
                  
                  return (
                    <div
                      key={day}
                      className="border-r border-gray-200 last:border-r-0 p-3 space-y-2"
                    >
                      {dayClasses.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                          <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Không có lịch</p>
                        </div>
                      ) : (
                        dayClasses
                          .sort((a, b) => {
                            const scheduleA = parseSchedule(a.schedule);
                            const scheduleB = parseSchedule(b.schedule);
                            return scheduleA?.startTime.localeCompare(scheduleB?.startTime) || 0;
                          })
                          .map((classItem) => (
                            <div
                              key={classItem._id}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm"
                            >
                              <div className="font-medium text-blue-900 mb-1">
                                {classItem.className}
                              </div>
                              <div className="space-y-1 text-blue-700">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{classItem.schedule}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{classItem.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  <span>{classItem.currentStudents || 0} học viên</span>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {trainerClasses.length}
                </div>
                <div className="text-sm text-gray-600">Tổng số lớp</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {trainerClasses.reduce((total, cls) => total + (cls.currentStudents || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Tổng học viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {trainerClasses.reduce((total, cls) => {
                    const schedule = parseSchedule(cls.schedule);
                    if (!schedule) return total;
                    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
                    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
                    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                    return total + (duration / 60) * schedule.days.length;
                  }, 0).toFixed(1)}h
                </div>
                <div className="text-sm text-gray-600">Giờ dạy/tuần</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrainerScheduleManager;