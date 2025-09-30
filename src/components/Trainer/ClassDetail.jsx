import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Phone,
  Mail,
  Award,
  Target,
  TrendingUp
} from "lucide-react";

export default function TrainerClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        return;
      }

      // Lấy chi tiết lớp học từ API
      const response = await axios.get(`http://localhost:5000/api/trainers/class/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const classData = response.data.class;
      setClassData(classData);
      setStudents(classData.students || []);
      
      // Mock attendance history - sẽ thay bằng API call thực
      const mockAttendance = [
        {
          session: classData.currentSession || 1,
          date: new Date().toISOString().split('T')[0],
          present: Math.floor(classData.currentStudents * 0.85),
          absent: Math.floor(classData.currentStudents * 0.15),
          rate: 85
        }
      ];
      setAttendanceHistory(mockAttendance);

    } catch (error) {
      console.error("Error fetching class data:", error);
      // Fallback to empty state
      setClassData(null);
      setStudents([]);
      setAttendanceHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = () => {
    // Logic cập nhật tiến độ
    console.log("Update progress");
  };

  const handleTakeAttendance = () => {
    // Logic điểm danh
    console.log("Take attendance");
  };

  const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 bg-${color}-100 rounded-lg`}>
          {React.cloneElement(icon, { className: `h-5 w-5 text-${color}-600` })}
        </div>
      </div>
    </div>
  );

  const StudentCard = ({ student }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{student.name}</h4>
          <p className="text-sm text-gray-600">{student.email}</p>
          <p className="text-sm text-gray-600">{student.phone}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
            student.attendanceRate >= 80 
              ? 'bg-green-100 text-green-800'
              : student.attendanceRate >= 60
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {student.attendanceRate}% tham gia
          </span>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        <p>Tham gia: {student.totalAttended}/{student.totalSessions} buổi</p>
        <p>Ngày đăng ký: {new Date(student.joinDate).toLocaleDateString("vi-VN")}</p>
      </div>
      
      <div className="flex space-x-2">
        <button className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Xem chi tiết
        </button>
        <button className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Phone className="h-4 w-4" />
        </button>
        <button className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Mail className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy thông tin lớp học</p>
      </div>
    );
  }

  const progressPercent = (classData.currentSession / classData.totalSessions) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{classData.className}</h1>
                <p className="text-gray-600">{classData.service} • {classData.schedule}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleTakeAttendance}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Điểm danh
              </button>
              <button
                onClick={handleUpdateProgress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Cập nhật tiến độ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Tổng quan" },
              { id: "students", label: "Học viên" },
              { id: "attendance", label: "Lịch sử điểm danh" },
              { id: "progress", label: "Tiến độ" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Tiến độ lớp học"
                value={`${classData.currentSession}/${classData.totalSessions}`}
                subtitle={`${Math.round(progressPercent)}% hoàn thành`}
                icon={<Target />}
                color="blue"
              />
              <StatCard
                title="Học viên hiện tại"
                value={`${classData.currentStudents}/${classData.maxStudents}`}
                subtitle="Còn chỗ trống"
                icon={<Users />}
                color="green"
              />
              <StatCard
                title="Tỷ lệ tham gia"
                value="85%"
                subtitle="Trung bình"
                icon={<TrendingUp />}
                color="orange"
              />
              <StatCard
                title="Buổi học tiếp theo"
                value="Thứ 2"
                subtitle="08:00 - 09:30"
                icon={<Calendar />}
                color="purple"
              />
            </div>

            {/* Class Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin lớp học</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">
                      <strong>Thời gian:</strong> {classData.schedule}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">
                      <strong>Địa điểm:</strong> {classData.location}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 mr-3 text-gray-400" />
                    <span className="text-sm">
                      <strong>Dịch vụ:</strong> {classData.service}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Ngày bắt đầu:</strong> {new Date(classData.startDate).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="text-sm">
                    <strong>Ngày kết thúc:</strong> {new Date(classData.endDate).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="text-sm">
                    <strong>Học phí:</strong> {classData.price.toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
              </div>
              {classData.description && (
                <div className="mt-4">
                  <strong className="text-sm">Mô tả:</strong>
                  <p className="text-sm text-gray-600 mt-1">{classData.description}</p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ lớp học</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Buổi học đã hoàn thành</span>
                  <span>{classData.currentSession}/{classData.totalSessions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  Còn {classData.totalSessions - classData.currentSession} buổi học nữa
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Danh sách học viên ({students.length})
              </h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Thêm học viên
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Lịch sử điểm danh</h2>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buổi học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Có mặt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vắng mặt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỷ lệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceHistory.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Buổi {record.session}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {record.present}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {record.absent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-blue-600 hover:text-blue-700 mr-3">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-700">
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Cập nhật tiến độ lớp học</h2>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center text-gray-500 py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Tính năng cập nhật tiến độ đang được phát triển</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}