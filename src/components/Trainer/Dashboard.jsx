import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Global/Nav";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle,
  MapPin,
  Eye,
  Star,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalClasses: 0,
      totalStudents: 0,
      todayClasses: 0,
      weekClasses: 0,
      attendanceRate: 0,
    },
    assignedClasses: [],
    todaySchedule: [],
    recentActivity: [],
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
      const response = await axios.get(
        "http://localhost:5000/api/trainers/assigned-classes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assignedClasses = response.data.classes || [];

      // Tính toán overview từ dữ liệu thực
      const overview = {
        totalClasses: assignedClasses.length,
        totalStudents: assignedClasses.reduce(
          (sum, c) => sum + (c.enrolledStudents || 0),
          0
        ),
        todayClasses: assignedClasses.filter((c) => {
          const today = new Date().getDay();
          const dayMap = {
            1: "T2",
            2: "T3",
            3: "T4",
            4: "T5",
            5: "T6",
            6: "T7",
            0: "CN",
          };
          return c.schedule && c.schedule.includes(dayMap[today]);
        }).length,
        weekClasses: assignedClasses.filter((c) => c.status === "ongoing")
          .length,
        attendanceRate: 85,
      };

      // Tạo lịch trình hôm nay
      const todaySchedule = assignedClasses
        .filter((c) => {
          const today = new Date().getDay();
          const dayMap = {
            1: "T2",
            2: "T3",
            3: "T4",
            4: "T5",
            5: "T6",
            6: "T7",
            0: "CN",
          };
          return c.schedule && c.schedule.includes(dayMap[today]);
        })
        .map((c) => ({
          id: c._id,
          className: c.className,
          time: "08:00 - 09:30", // Có thể lấy từ database sau
          location: c.location,
          students: c.enrolledStudents,
        }));

      setDashboardData({
        overview,
        assignedClasses,
        todaySchedule,
        recentActivity: [],
      });
    } catch (error) {
      console.error("Error fetching trainer dashboard data:", error);
      setDashboardData({
        overview: {
          totalClasses: 0,
          totalStudents: 0,
          todayClasses: 0,
          weekClasses: 0,
          attendanceRate: 0,
        },
        assignedClasses: [],
        todaySchedule: [],
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "blue",
    trend,
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mb-2`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                {trend}
              </span>
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
    const progressPercent =
      (classItem.currentSession / classItem.totalSessions) * 100;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg mb-1">
              {classItem.className}
            </h4>
            <p className="text-sm text-gray-600">{classItem.service}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>{classItem.schedule}</span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              classItem.status === "ongoing"
                ? "bg-green-100 text-green-800"
                : classItem.status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {classItem.status === "ongoing"
              ? "Đang diễn ra"
              : classItem.status === "completed"
              ? "Đã hoàn thành"
              : "Chưa bắt đầu"}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span>
                {classItem.enrolledStudents}/{classItem.maxStudents} học viên
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{classItem.location}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tiến độ buổi học</span>
              <span className="font-medium">
                {classItem.currentSession}/{classItem.totalSessions}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => navigate(`/trainer/class/${classItem._id}`)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Eye className="h-4 w-4" />
              Xem chi tiết
            </button>
            <button
              onClick={() => navigate(`/trainer/attendance/${classItem._id}`)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <CheckCircle className="h-4 w-4" />
              Điểm danh
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ScheduleCard = ({ scheduleItem }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">
            {scheduleItem.className}
          </h4>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>{scheduleItem.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{scheduleItem.location}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1" />
            <span>{scheduleItem.students} học viên</span>
          </div>
          <button
            onClick={() => navigate(`/trainer/attendance/${scheduleItem.id}`)}
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Điểm danh
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav user={user} setUser={setUser} />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-64px)]">
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
      <div className="pt-16 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Huấn Luyện Viên
            </h1>
            <p className="text-gray-600 mt-2">
              Chào mừng trở lại, {user?.fullName}! Quản lý lớp học và học viên
              của bạn.
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Tổng số lớp"
              value={dashboardData.overview.totalClasses}
              subtitle="Lớp học được gán"
              icon={<BookOpen />}
              color="blue"
            />
            <StatCard
              title="Tổng học viên"
              value={dashboardData.overview.totalStudents}
              subtitle="Trong tất cả lớp"
              icon={<Users />}
              color="green"
            />
            <StatCard
              title="Lớp hôm nay"
              value={dashboardData.overview.todayClasses}
              subtitle="Cần điểm danh"
              icon={<Calendar />}
              color="orange"
            />
            <StatCard
              title="Tỷ lệ điểm danh"
              value={`${dashboardData.overview.attendanceRate}%`}
              subtitle="Trung bình"
              icon={<BarChart3 />}
              color="purple"
              trend="+5% so với tuần trước"
            />
          </div>


          {/* Quick Actions */}
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <button
                  onClick={() => navigate("/trainer/classes")}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Quản lý lớp học
                  </span>
                </button>
                <button
                  onClick={() => navigate("/trainer/schedule")}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <Calendar className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Xem lịch dạy
                  </span>
                </button>
                <button
                  onClick={() => navigate("/trainer/issue-report")}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Báo cáo vấn đề
                  </span>
                </button>
                <button
                  onClick={() => navigate("/services")}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <Star className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Dịch vụ
                  </span>
                </button>
                <button
                  onClick={() => navigate("/club")}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <Users className="h-8 w-8 text-orange-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Câu lạc bộ
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Assigned Classes & Today's Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assigned Classes */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Lớp học được gán
                  </h2>
                  <button
                    onClick={() => navigate("/trainer/classes")}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Xem tất cả
                  </button>
                </div>

                {dashboardData.assignedClasses.length > 0 ? (
                  <div className="grid gap-6">
                    {dashboardData.assignedClasses
                      .slice(0, 3)
                      .map((classItem) => (
                        <ClassCard key={classItem._id} classItem={classItem} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Chưa có lớp học được gán
                    </h3>
                    <p className="text-gray-600">
                      Liên hệ admin để được gán lớp học
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Lịch hôm nay
                  </h2>
                  <button
                    onClick={() => navigate("/trainer/schedule")}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {dashboardData.todaySchedule.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.todaySchedule.map((scheduleItem) => (
                      <ScheduleCard
                        key={scheduleItem.id}
                        scheduleItem={scheduleItem}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-1">
                      Không có lớp học hôm nay
                    </h3>
                    <p className="text-sm text-gray-600">
                      Hãy nghỉ ngơi và chuẩn bị cho ngày mai!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
