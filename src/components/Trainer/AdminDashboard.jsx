import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  BarChart3,
  MapPin,
  User,
  Phone,
  Mail,
  Award,
  Star,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Filter
} from "lucide-react";

export default function TrainerAdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/classes')) {
      setActiveTab('classes');
    } else if (path.includes('/schedule')) {
      setActiveTab('schedule');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalClasses: 0,
      totalStudents: 0,
      todayClasses: 0,
      weekClasses: 0,
      attendanceRate: 0
    },
    assignedClasses: [],
    todaySchedule: [],
    recentActivity: []
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      // Lấy danh sách lớp học được gán cho trainer từ API
      const response = await axios.get("http://localhost:5000/api/trainers/assigned-classes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const assignedClasses = response.data.classes || [];
      
      // Tính toán overview từ dữ liệu thực
      const overview = {
        totalClasses: assignedClasses.length,
        totalStudents: assignedClasses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0),
        todayClasses: assignedClasses.filter(c => {
          const today = new Date().getDay();
          const dayMap = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN' };
          return c.schedule && c.schedule.includes(dayMap[today]);
        }).length,
        weekClasses: assignedClasses.filter(c => c.status === 'ongoing').length,
        attendanceRate: 85
      };

      // Lọc lịch dạy hôm nay
      const today = new Date().getDay();
      const dayMap = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 0: 'CN' };
      const todaySchedule = assignedClasses.filter(c => {
        return c.schedule && c.schedule.includes(dayMap[today]) && c.status === 'ongoing';
      }).map(c => ({
        id: c._id,
        className: c.className,
        time: c.schedule.split(' - ')[1] || "Chưa xác định",
        location: c.location || "Chưa xác định",
        students: c.enrolledStudents || 0,
        status: "upcoming"
      }));

      setDashboardData({
        overview,
        assignedClasses: assignedClasses.map(c => ({
          id: c._id,
          className: c.className,
          service: c.service,
          schedule: c.schedule,
          location: c.location,
          students: c.enrolledStudents || 0,
          maxStudents: c.maxStudents || 20,
          currentSession: c.currentSession || 1,
          totalSessions: c.totalSessions || 12,
          status: c.status
        })),
        todaySchedule,
        recentActivity: [
          {
            type: "attendance",
            message: `Điểm danh lớp ${assignedClasses[0]?.className || "N/A"}`,
            time: "2 giờ trước"
          }
        ]
      });
      
    } catch (error) {
      console.error("Error fetching trainer dashboard data:", error);
      
      // Set empty state if API fails
      setDashboardData({
        overview: { totalClasses: 0, totalStudents: 0, todayClasses: 0, weekClasses: 0, attendanceRate: 0 },
        assignedClasses: [],
        todaySchedule: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = "blue", trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mb-2`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-4 bg-${color}-100 rounded-xl`}>
          {React.cloneElement(icon, { className: `h-8 w-8 text-${color}-600` })}
        </div>
      </div>
    </div>
  );

  const ClassCard = ({ classItem }) => {
    const progressPercent = (classItem.currentSession / classItem.totalSessions) * 100;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg mb-1">{classItem.className}</h4>
            <p className="text-sm text-gray-600">{classItem.service}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>{classItem.schedule}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            classItem.status === 'ongoing' 
              ? 'bg-green-100 text-green-800'
              : classItem.status === 'completed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {classItem.status === 'ongoing' ? 'Đang diễn ra' :
             classItem.status === 'completed' ? 'Đã hoàn thành' : 'Chưa bắt đầu'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-sm">
            <span className="text-gray-600">Học viên:</span>
            <span className="font-medium ml-1">{classItem.students}/{classItem.maxStudents}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Tiến độ:</span>
            <span className="font-medium ml-1">{classItem.currentSession}/{classItem.totalSessions}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Tiến độ hoàn thành</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate(`/trainer/class/${classItem.id}`)}
            className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Xem chi tiết
          </button>
          <button 
            onClick={() => navigate(`/trainer/attendance/${classItem.id}`)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const TodayScheduleCard = ({ schedule }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{schedule.className}</h4>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>{schedule.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{schedule.location}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-900">{schedule.students} HV</span>
          <div className="text-xs text-gray-500 mt-1">
            {schedule.status === 'upcoming' ? 'Sắp tới' : 'Đang diễn ra'}
          </div>
        </div>
      </div>
      <div className="flex space-x-2 mt-3">
        <button 
          onClick={() => navigate(`/trainer/class/${schedule.id}`)}
          className="flex-1 py-1 px-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
        >
          Chi tiết
        </button>
        <button 
          onClick={() => navigate(`/trainer/attendance/${schedule.id}`)}
          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
        >
          Điểm danh
        </button>
      </div>
    </div>
  );

  const sidebarNavigation = [
    {
      name: "Tổng quan",
      id: "dashboard",
      path: "/trainer/dashboard",
      icon: BarChart3,
      current: activeTab === "dashboard"
    },
    {
      name: "Lớp học",
      id: "classes",
      path: "/trainer/classes",
      icon: BookOpen,
      current: activeTab === "classes"
    },
    {
      name: "Lịch dạy",
      id: "schedule",
      path: "/trainer/schedule",
      icon: Calendar,
      current: activeTab === "schedule"
    },
    {
      name: "Học viên",
      id: "students",
      path: "/trainer/students",
      icon: Users,
      current: activeTab === "students"
    },
    {
      name: "Thống kê",
      id: "stats",
      path: "/trainer/stats",
      icon: TrendingUp,
      current: activeTab === "stats"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h2 className="text-lg font-semibold text-gray-900">Trainer Dashboard</h2>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {sidebarNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${
                    item.current
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-4 flex-shrink-0 h-6 w-6 ${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-lg font-semibold text-gray-900">Trainer Dashboard</h2>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {sidebarNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    item.current
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-6 w-6 ${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="lg:flex lg:items-center lg:justify-between mb-8">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    {activeTab === 'dashboard' && 'Tổng quan'}
                    {activeTab === 'classes' && 'Quản lý lớp học'}
                    {activeTab === 'schedule' && 'Lịch dạy'}
                    {activeTab === 'students' && 'Quản lý học viên'}
                    {activeTab === 'stats' && 'Thống kê'}
                  </h2>
                  <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {new Date().toLocaleDateString('vi-VN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      title="Tổng lớp phụ trách"
                      value={dashboardData.overview.totalClasses}
                      subtitle="Đang hoạt động"
                      icon={<BookOpen />}
                      color="blue"
                      trend="+2 lớp mới"
                    />
                    <StatCard
                      title="Tổng học viên"
                      value={dashboardData.overview.totalStudents}
                      subtitle="Tất cả lớp"
                      icon={<Users />}
                      color="green"
                      trend="+5 học viên"
                    />
                    <StatCard
                      title="Lớp hôm nay"
                      value={dashboardData.overview.todayClasses}
                      subtitle="Cần điểm danh"
                      icon={<Calendar />}
                      color="orange"
                    />
                    <StatCard
                      title="Tỷ lệ tham gia"
                      value={`${dashboardData.overview.attendanceRate}%`}
                      subtitle="Trung bình"
                      icon={<TrendingUp />}
                      color="purple"
                      trend="+3% tuần này"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Today's Schedule */}
                    <div className="lg:col-span-1">
                      <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Lịch dạy hôm nay
                          </h3>
                          {dashboardData.todaySchedule.length > 0 ? (
                            <div className="space-y-3">
                              {dashboardData.todaySchedule.map((schedule) => (
                                <TodayScheduleCard key={schedule.id} schedule={schedule} />
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">Không có lớp học nào hôm nay</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Classes */}
                    <div className="lg:col-span-2">
                      <div className="bg-white shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              Lớp học gần đây
                            </h3>
                            <button
                              onClick={() => {
                                setActiveTab('classes');
                                navigate('/trainer/classes');
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Xem tất cả
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dashboardData.assignedClasses.slice(0, 4).map((classItem) => (
                              <ClassCard key={classItem.id} classItem={classItem} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Classes Tab */}
              {activeTab === 'classes' && (
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Tất cả lớp học ({dashboardData.assignedClasses.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {dashboardData.assignedClasses.map((classItem) => (
                          <ClassCard key={classItem.id} classItem={classItem} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs - placeholder */}
              {activeTab !== 'dashboard' && activeTab !== 'classes' && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        {activeTab === 'schedule' && <Calendar className="h-12 w-12 mx-auto" />}
                        {activeTab === 'students' && <Users className="h-12 w-12 mx-auto" />}
                        {activeTab === 'stats' && <BarChart3 className="h-12 w-12 mx-auto" />}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {activeTab === 'schedule' && 'Lịch dạy'}
                        {activeTab === 'students' && 'Quản lý học viên'}
                        {activeTab === 'stats' && 'Thống kê chi tiết'}
                      </h3>
                      <p className="text-gray-500">Tính năng đang được phát triển</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}