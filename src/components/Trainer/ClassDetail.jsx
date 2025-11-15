import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Global/Nav";
import SessionContentModal from "./SessionContentModal";
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
  TrendingUp,
  BookOpen,
} from "lucide-react";

export default function TrainerClassDetail() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [sessionContents, setSessionContents] = useState({});
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [scheduleChanges, setScheduleChanges] = useState([]);

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    fetchClassData();
  }, [classId]);

  const fetchSessionContents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/session-content/class/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const contentsMap = {};
        response.data.data.forEach(content => {
          contentsMap[content.sessionNumber] = content;
        });
        setSessionContents(contentsMap);
      }
    } catch (error) {
      console.error("Error fetching session contents:", error);
    }
  };
  
  const fetchScheduleChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/classes/${classId}/schedule-changes`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setScheduleChanges(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching schedule changes:", error);
      setScheduleChanges([]);
    }
  };

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found");
        return;
      }
      
      // Fetch schedule changes first and get the result
      let scheduleChangesList = [];
      try {
        const changesResponse = await axios.get(
          `http://localhost:5000/api/classes/${classId}/schedule-changes`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (changesResponse.data.success) {
          scheduleChangesList = changesResponse.data.data || [];
          setScheduleChanges(scheduleChangesList);
        }
      } catch (error) {
        console.error("Error fetching schedule changes:", error);
      }

      // Lấy chi tiết lớp học từ API
      const response = await axios.get(
        `http://localhost:5000/api/trainers/class/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const classData = response.data.class;
      setClassData(classData);

      // Students data is already included in the class response from trainer API
      if (classData.students && classData.students.length > 0) {
        const studentsWithPaymentStatus = classData.students.map((student) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone || "Chưa cập nhật",
          paymentStatus: student.paymentStatus || false,
          attendanceRate:
            student.attendanceRate || Math.round(Math.random() * 40 + 60),
          totalAttended: student.totalAttended || 0,
          totalSessions: student.totalSessions || 0,
          joinDate: student.joinDate,
        }));

        console.log("Students from class data:", studentsWithPaymentStatus);
        setStudents(studentsWithPaymentStatus);
      } else {
        console.log("No students found in class data");
        setStudents([]);
      }

      // Lấy lịch sử điểm danh thực từ API
      try {
        const attendanceResponse = await axios.get(
          `http://localhost:5000/api/attendance/class/${classId}/sessions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sessions = attendanceResponse.data.sessions || [];
        const attendanceHistory = sessions.map((session) => {
          // Tìm xem buổi này có bị thay đổi không (dùng scheduleChangesList từ fetch ở trên)
          const scheduleChange = scheduleChangesList.find(
            change => 
              change.status === 'approved' && 
              change.makeupSchedule && 
              new Date(change.originalDate).toDateString() === new Date(session.sessionDate).toDateString()
          );
          
          return {
            session: session.sessionNumber,
            date: scheduleChange ? scheduleChange.makeupSchedule.date : session.sessionDate,
            originalDate: scheduleChange ? session.sessionDate : null,
            isRescheduled: !!scheduleChange,
            present: session.presentCount,
            absent: session.totalStudents - session.presentCount,
            rate:
              session.totalStudents > 0
                ? Math.round((session.presentCount / session.totalStudents) * 100)
                : 0,
          };
        });

        setAttendanceHistory(attendanceHistory);
      } catch (attendanceError) {
        console.error("Error fetching attendance history:", attendanceError);
        // Fallback to empty array
        setAttendanceHistory([]);
      }

      // Fetch session contents
      fetchSessionContents();
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
    if (!classData) {
      console.error("Class data not available");
      return;
    }
    // Logic cập nhật tiến độ
    console.log("Update progress for class:", classData._id);
    // TODO: Implement progress update functionality
  };

  const handleTakeAttendance = () => {
    if (!classData || !classData._id) {
      console.error("Class data or ID not available");
      return;
    }
    console.log("Navigating to attendance for class:", classData._id);
    navigate(`/trainer/attendance/${classData._id}`);
  };

  const handleAddSessionContent = (sessionNumber) => {
    setSelectedSession(sessionNumber);
    setShowContentModal(true);
  };

  const handleSaveSessionContent = (content) => {
    setSessionContents(prev => ({
      ...prev,
      [content.sessionNumber]: content
    }));
    fetchSessionContents(); // Refresh to get updated data
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
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              student.attendanceRate >= 80
                ? "bg-green-100 text-green-800"
                : student.attendanceRate >= 60
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {student.attendanceRate}% tham gia
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <p>
          Tham gia: {student.totalAttended}/{student.totalSessions} buổi
        </p>
        <p>
          Ngày đăng ký: {new Date(student.joinDate).toLocaleDateString("vi-VN")}
        </p>
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

  const progressPercent =
    ((classData?.currentSession || 0) / (classData?.totalSessions || 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav user={user} setUser={setUser} />

      <div className="pt-20">
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
                  <h1 className="text-2xl font-bold text-gray-900">
                    {classData.className}
                  </h1>
                  <p className="text-gray-600">
                    {classData.service} • {classData.schedule}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleTakeAttendance}
                  disabled={!classData || !classData._id}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                    !classData || !classData._id
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Điểm danh
                </button>
                <button
                  onClick={() => handleAddSessionContent((classData?.currentSession || 0) + 1)}
                  disabled={!classData || !classData._id}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                    !classData || !classData._id
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : sessionContents[(classData?.currentSession || 0) + 1]
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {sessionContents[(classData?.currentSession || 0) + 1] ? "Sửa nội dung" : "Thêm nội dung"}
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
                  value={`${classData.currentSession || 0}/${
                    classData.totalSessions || 0
                  }`}
                  subtitle={`${Math.round(
                    ((classData.currentSession || 0) /
                      (classData.totalSessions || 1)) *
                      100
                  )}% hoàn thành`}
                  icon={<Target />}
                  color="blue"
                />
                <StatCard
                  title="Học viên đã đăng ký"
                  value={`${students.length}/${classData.maxStudents || 0}`}
                  subtitle={`${
                    students.filter((s) => s.paymentStatus).length
                  } đã thanh toán`}
                  icon={<Users />}
                  color="green"
                />
                <StatCard
                  title="Tỷ lệ tham gia"
                  value={
                    attendanceHistory.length > 0
                      ? `${Math.round(
                          attendanceHistory.reduce(
                            (acc, curr) => acc + curr.rate,
                            0
                          ) / attendanceHistory.length
                        )}%`
                      : "Chưa có dữ liệu"
                  }
                  subtitle="Trung bình các buổi học"
                  icon={<TrendingUp />}
                  color="orange"
                />
                <StatCard
                  title="Trạng thái lớp học"
                  value={
                    classData.status === "ongoing"
                      ? "Đang diễn ra"
                      : classData.status === "completed"
                      ? "Hoàn thành"
                      : "Sắp bắt đầu"
                  }
                  subtitle={`Buổi tiếp theo: ${
                    (classData.currentSession || 0) + 1
                  }`}
                  icon={<Calendar />}
                  color="purple"
                />
              </div>

              {/* Class Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin lớp học
                </h3>
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
                      <strong>Ngày bắt đầu:</strong>{" "}
                      {new Date(classData.startDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                    <div className="text-sm">
                      <strong>Ngày kết thúc:</strong>{" "}
                      {new Date(classData.endDate).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-sm">
                      <strong>Học phí:</strong>{" "}
                      {classData.price.toLocaleString("vi-VN")} VNĐ
                    </div>
                  </div>
                </div>
                {classData.description && (
                  <div className="mt-4">
                    <strong className="text-sm">Mô tả:</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      {classData.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tiến độ lớp học
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Buổi học đã hoàn thành</span>
                    <span>
                      {classData?.currentSession || 0}/
                      {classData?.totalSessions || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(classData?.totalSessions || 0) -
                      (classData?.currentSession || 0) >
                    0
                      ? `Còn ${
                          (classData?.totalSessions || 0) -
                          (classData?.currentSession || 0)
                        } buổi học nữa`
                      : "Đã hoàn thành tất cả buổi học"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Danh sách học viên đã đăng ký ({students.length})
                </h2>
                <div className="text-sm text-gray-600">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    {students.filter((s) => s.paymentStatus).length} đã thanh
                    toán
                  </span>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có học viên đăng ký
                  </h3>
                  <p className="text-gray-500">
                    Học viên sẽ tự động hiển thị ở đây khi họ đăng ký và thanh
                    toán lớp học này.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                Lịch sử điểm danh
              </h2>

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
                        Nội dung
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>
                            <div className={record.isRescheduled ? "text-orange-600 font-medium" : "text-gray-500"}>
                              {new Date(record.date).toLocaleDateString("vi-VN")}
                            </div>
                            {record.isRescheduled && record.originalDate && (
                              <div className="text-xs text-gray-400 line-through">
                                {new Date(record.originalDate).toLocaleDateString("vi-VN")}
                              </div>
                            )}
                          </div>
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
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {sessionContents[record.session] ? (
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900 truncate max-w-xs">
                                {sessionContents[record.session].title}
                              </div>
                              <button
                                onClick={() => handleAddSessionContent(record.session)}
                                className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                              >
                                <BookOpen className="h-3 w-3 mr-1" />
                                Xem/Sửa
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddSessionContent(record.session)}
                              className="text-purple-600 hover:text-purple-700 text-xs flex items-center"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Thêm nội dung
                            </button>
                          )}
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
              <h2 className="text-xl font-bold text-gray-900">
                Cập nhật tiến độ lớp học
              </h2>

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

      {/* Session Content Modal */}
      {showContentModal && selectedSession && (
        <SessionContentModal
          classId={classId}
          sessionNumber={selectedSession}
          existingContent={sessionContents[selectedSession]}
          onClose={() => {
            setShowContentModal(false);
            setSelectedSession(null);
          }}
          onSave={handleSaveSessionContent}
        />
      )}
    </div>
  );
}
