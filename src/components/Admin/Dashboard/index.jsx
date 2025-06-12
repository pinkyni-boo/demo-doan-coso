import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  CreditCard,
  Calendar,
  Dumbbell,
  Building,
  TrendingUp,
  ImageIcon,
  ClipboardList,
} from "lucide-react";
import AdminNav from "../AdminNav";
import ImageManager from "../ImageManager";
import PaymentManagement from "../PaymentManagement";
import MembershipManagement from "../MembershipManagement";
import AdminServiceManager from "../qldv";
import AdminClubManager from "../qlclb";
import ClassManagement from "../ClassManagement";
import AttendanceManagement from "../AttendanceManagement";
import Statistics from "../Statistics";
import UserManagement from "../UserManagement";

const AdminDashboard = () => {
  const [activeModule, setActiveModule] = useState("dashboard");

  // Render content based on active module
  const renderContent = () => {
    switch (activeModule) {
      case "users":
        return <UserManagement />;
      case "images":
        return <ImageManager />;
      case "payments":
        return <PaymentManagement />;
      case "memberships":
        return <MembershipManagement />;
      case "services":
        return <AdminServiceManager />;
      case "clubs":
        return <AdminClubManager />;
      case "classes":
        return <ClassManagement />;
      case "attendance":
        return <AttendanceManagement />;
      case "stats":
        return <Statistics />;
      case "dashboard":
      default:
        return <DashboardHome setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-yellow-50">
      <AdminNav activeModule={activeModule} setActiveModule={setActiveModule} />

      {/* Main content area với padding phù hợp */}
      <main className="ml-64 pt-20 min-h-screen">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

// Dashboard home with enhanced styling
const DashboardHome = ({ setActiveModule }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/stats/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-amber-200/30 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-stone-800 vintage-heading mb-2">
              Admin Dashboard
            </h1>
            <p className="text-stone-600 vintage-serif text-lg">
              Chào mừng bạn đến với bảng điều khiển quản trị Royal Fitness
            </p>
          </div>
          <div className="w-20 h-20 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      {/* Enhanced Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value={stats?.stats?.totalUsers || 0}
          change={`+${stats?.stats?.newUsersThisMonth || 0} tháng này`}
          icon={<Users className="h-7 w-7" />}
          color="blue"
          trend="up"
        />
        <StatCard
          title="Doanh thu tháng"
          value={formatCurrency(stats?.stats?.monthlyRevenue || 0)}
          change={`${stats?.stats?.attendanceRate || 0}% tỷ lệ tham gia`}
          icon={<CreditCard className="h-7 w-7" />}
          color="green"
          trend="up"
        />
        <StatCard
          title="Lớp học hoạt động"
          value={stats?.stats?.activeClasses || 0}
          change={`${stats?.stats?.newMembersThisMonth || 0} đăng ký mới`}
          icon={<Calendar className="h-7 w-7" />}
          color="purple"
          trend="stable"
        />
        <StatCard
          title="Thành viên mới"
          value={stats?.stats?.newMembersThisMonth || 0}
          change="Tháng này"
          icon={<Users className="h-7 w-7" />}
          color="amber"
          trend="up"
        />
      </div>

      {/* Enhanced Charts Section */}
      {stats?.charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enrollment Chart */}
          <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl p-8">
            <h3 className="text-xl font-bold text-stone-800 vintage-heading mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              Đăng ký 7 ngày qua
            </h3>
            <div className="space-y-4">
              {stats.charts.last7Days.map((day, index) => (
                <div key={index} className="flex items-center group">
                  <div className="w-24 text-sm text-stone-600 vintage-serif">
                    {new Date(day.date).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-stone-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out group-hover:from-blue-600 group-hover:to-blue-700"
                        style={{
                          width: `${Math.max(
                            (day.enrollments /
                              Math.max(
                                ...stats.charts.last7Days.map(
                                  (d) => d.enrollments
                                )
                              )) *
                              100,
                            8
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm font-bold text-stone-800 vintage-sans">
                    {day.enrollments}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Services */}
          <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl p-8">
            <h3 className="text-xl font-bold text-stone-800 vintage-heading mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              Dịch vụ phổ biến
            </h3>
            <div className="space-y-4">
              {stats.charts.popularServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between group hover:bg-amber-50/50 rounded-xl p-3 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full mr-4 shadow-sm ${
                        index === 0
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : index === 1
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          : index === 2
                          ? "bg-gradient-to-r from-amber-500 to-amber-600"
                          : index === 3
                          ? "bg-gradient-to-r from-purple-500 to-purple-600"
                          : "bg-gradient-to-r from-stone-500 to-stone-600"
                      }`}
                    ></div>
                    <span className="text-sm font-semibold text-stone-800 vintage-sans">
                      {service._id}
                    </span>
                  </div>
                  <div className="text-sm text-stone-600 font-medium vintage-serif">
                    {service.count} lượt
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Quick actions */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-stone-800 vintage-heading mb-6">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <QuickAction
            title="Quản lý lớp học"
            icon={<Calendar className="h-6 w-6" />}
            onClick={() => setActiveModule("classes")}
            color="purple"
          />
          <QuickAction
            title="Điểm danh"
            icon={<ClipboardList className="h-6 w-6" />}
            onClick={() => setActiveModule("attendance")}
            color="blue"
          />
          <QuickAction
            title="Thanh toán"
            icon={<CreditCard className="h-6 w-6" />}
            onClick={() => setActiveModule("payments")}
            color="green"
          />
          <QuickAction
            title="Thành viên"
            icon={<Users className="h-6 w-6" />}
            onClick={() => setActiveModule("users")}
            color="indigo"
          />
          <QuickAction
            title="Dịch vụ"
            icon={<Dumbbell className="h-6 w-6" />}
            onClick={() => setActiveModule("services")}
            color="pink"
          />
          <QuickAction
            title="CLB"
            icon={<Building className="h-6 w-6" />}
            onClick={() => setActiveModule("clubs")}
            color="amber"
          />
          <QuickAction
            title="Hình ảnh"
            icon={<ImageIcon className="h-6 w-6" />}
            onClick={() => setActiveModule("images")}
            color="blue"
          />
          <QuickAction
            title="Thống kê"
            icon={<TrendingUp className="h-6 w-6" />}
            onClick={() => setActiveModule("stats")}
            color="indigo"
          />
        </div>
      </div>

      {/* Enhanced Recent activity */}
      <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl overflow-hidden">
        <div className="p-8 border-b border-amber-200/50">
          <h2 className="text-2xl font-bold text-stone-800 vintage-heading">
            Hoạt động gần đây
          </h2>
        </div>
        <div className="divide-y divide-amber-100">
          {stats?.recentActivities?.enrollments
            ?.slice(0, 5)
            .map((enrollment, index) => (
              <ActivityItem
                key={index}
                title={`${enrollment.user?.username} đăng ký lớp ${enrollment.class?.className}`}
                time={new Date(enrollment.enrollmentDate).toLocaleDateString(
                  "vi-VN"
                )}
                icon={<Users className="h-5 w-5" />}
                color="blue"
              />
            ))}
          {stats?.recentActivities?.classes
            ?.slice(0, 3)
            .map((classItem, index) => (
              <ActivityItem
                key={`class-${index}`}
                title={`Lớp ${classItem.className} (${classItem.serviceName}) đã được tạo`}
                time={new Date(classItem.createdAt).toLocaleDateString("vi-VN")}
                icon={<Calendar className="h-5 w-5" />}
                color="purple"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ title, value, change, icon, color, trend }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    pink: "from-pink-500 to-pink-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    stable: "→",
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-2 border-amber-200/50 shadow-2xl rounded-3xl p-6 hover:shadow-golden transition-all duration-300 hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-4 rounded-2xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}
        >
          <div className="text-white">{icon}</div>
        </div>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${
            trend === "up"
              ? "text-emerald-700 bg-emerald-100"
              : trend === "down"
              ? "text-red-700 bg-red-100"
              : "text-amber-700 bg-amber-100"
          }`}
        >
          {trendIcons[trend]} {change}
        </span>
      </div>
      <h3 className="text-sm font-medium text-stone-600 vintage-serif mb-2">
        {title}
      </h3>
      <p className="text-3xl font-bold text-stone-800 vintage-heading">
        {value}
      </p>
    </div>
  );
};

// Enhanced Quick Action Component
const QuickAction = ({ title, icon, onClick, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green:
      "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    purple:
      "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    amber:
      "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
    pink: "from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700",
    indigo:
      "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
  };

  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg hover:shadow-xl hover:scale-105`}
    >
      <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <span className="text-sm font-semibold text-center vintage-sans">
        {title}
      </span>
    </button>
  );
};

// Enhanced Activity Item Component
const ActivityItem = ({ title, time, icon, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
    pink: "from-pink-500 to-pink-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  return (
    <div className="flex items-center px-8 py-6 hover:bg-amber-50/50 transition-all duration-300 group">
      <div
        className={`p-3 rounded-xl mr-4 bg-gradient-to-r ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        <div className="text-white">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-stone-800 vintage-sans mb-1">
          {title}
        </p>
        <p className="text-xs text-stone-600 vintage-serif">{time}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
