import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  BookOpen,
  Award,
  MapPin,
  Plus,
  Filter,
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Edit,
  Eye,
  BarChart3,
  CheckCircle,
  Star,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

export default function TrainerMobileDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    todayClasses: [],
    upcomingClasses: [],
    recentAttendance: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockData = {
        stats: {
          totalClasses: 8,
          todayClasses: 3,
          totalStudents: 45,
          avgAttendance: 85
        },
        todayClasses: [
          {
            id: 1,
            className: "Yoga Cơ Bản",
            time: "08:00 - 09:30",
            location: "Phòng 1",
            students: 12,
            status: "upcoming"
          },
          {
            id: 2, 
            className: "Pilates",
            time: "14:00 - 15:30",
            location: "Phòng 2",
            students: 8,
            status: "upcoming"
          }
        ],
        upcomingClasses: [
          {
            id: 3,
            className: "Zumba",
            date: "Thứ 3",
            time: "19:00 - 20:00",
            students: 15
          }
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          {React.cloneElement(icon, { className: `h-6 w-6 text-${color}-600` })}
        </div>
      </div>
    </div>
  );

  const TodayClassCard = ({ classItem }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{classItem.className}</h4>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>{classItem.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{classItem.location}</span>
          </div>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          {classItem.students} HV
        </span>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => navigate(`/trainer/class/${classItem.id}`)}
          className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Chi tiết
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

  const QuickActionCard = ({ title, description, icon, onClick, color = "blue" }) => (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            {React.cloneElement(icon, { className: `h-5 w-5 text-${color}-600` })}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard HLV</h1>
            <p className="text-sm text-gray-600">Chào mừng trở lại!</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <span>Thống kê</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span>Lịch dạy</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
                <span>Học viên</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5 text-gray-600" />
                <span>Cài đặt</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg text-red-600">
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Lớp hôm nay"
            value={dashboardData.stats.todayClasses}
            icon={<Calendar />}
            color="blue"
          />
          <StatCard
            title="Tổng học viên"
            value={dashboardData.stats.totalStudents}
            icon={<Users />}
            color="green"
          />
          <StatCard
            title="Tổng lớp"
            value={dashboardData.stats.totalClasses}
            icon={<BookOpen />}
            color="purple"
          />
          <StatCard
            title="Tỷ lệ tham gia"
            value={`${dashboardData.stats.avgAttendance}%`}
            icon={<TrendingUp />}
            color="orange"
          />
        </div>

        {/* Today's Classes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Lớp học hôm nay</h2>
            <button className="text-blue-600 text-sm font-medium">Xem tất cả</button>
          </div>
          
          {dashboardData.todayClasses.length > 0 ? (
            <div>
              {dashboardData.todayClasses.map((classItem) => (
                <TodayClassCard key={classItem.id} classItem={classItem} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Không có lớp học nào hôm nay</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            <QuickActionCard
              title="Xem lịch dạy"
              description="Lịch dạy tuần này"
              icon={<Calendar />}
              onClick={() => console.log("View schedule")}
              color="blue"
            />
            <QuickActionCard
              title="Thống kê học viên"
              description="Báo cáo tham gia"
              icon={<BarChart3 />}
              onClick={() => console.log("View stats")}
              color="green"
            />
            <QuickActionCard
              title="Quản lý lớp học"
              description="Danh sách lớp phụ trách"
              icon={<BookOpen />}
              onClick={() => console.log("Manage classes")}
              color="purple"
            />
            <QuickActionCard
              title="Thông tin cá nhân"
              description="Cập nhật hồ sơ"
              icon={<User />}
              onClick={() => navigate("/user")}
              color="orange"
            />
          </div>
        </div>

        {/* Upcoming Classes Preview */}
        {dashboardData.upcomingClasses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lớp sắp tới</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {dashboardData.upcomingClasses.map((classItem, index) => (
                <div key={classItem.id} className={`flex items-center justify-between ${index > 0 ? 'pt-3 border-t border-gray-100' : ''}`}>
                  <div>
                    <h4 className="font-medium text-gray-900">{classItem.className}</h4>
                    <p className="text-sm text-gray-600">{classItem.date} • {classItem.time}</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">{classItem.students} HV</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}