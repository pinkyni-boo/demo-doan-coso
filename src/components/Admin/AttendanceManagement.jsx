import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  UserCheck,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
} from "lucide-react";

export default function AttendanceManagement() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paidStudentsInfo, setPaidStudentsInfo] = useState(null); // Thêm state

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(
        response.data.filter(
          (cls) => cls.status === "ongoing" || cls.status === "upcoming"
        )
      );
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm function để lấy thông tin học viên đã thanh toán
  const fetchPaidStudentsInfo = async (classId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/attendance/class/${classId}/paid-students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPaidStudentsInfo(response.data);
    } catch (error) {
      console.error("Error fetching paid students info:", error);
      setPaidStudentsInfo(null);
    }
  };

  const createSession = async (classId) => {
    try {
      const token = localStorage.getItem("token");
      const classInfo = classes.find((c) => c._id === classId);
      const sessionNumber = (classInfo.currentSession || 0) + 1;

      // Kiểm tra có học viên đã thanh toán không
      await fetchPaidStudentsInfo(classId);

      const response = await axios.post(
        "http://localhost:5000/api/attendance/session",
        {
          classId,
          sessionNumber,
          sessionDate: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update class session
      await axios.put(
        `http://localhost:5000/api/attendance/class/${classId}/session`,
        {
          currentSession: sessionNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showNotification("✅ Tạo buổi học mới thành công!");

      // Refresh classes
      await fetchClasses();

      // Nếu đang xem class này, refresh sessions
      if (selectedClass?._id === classId) {
        await fetchClassSessions(classId);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      const errorMessage =
        error.response?.data?.message || "Lỗi khi tạo buổi học";
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  const fetchClassSessions = async (classId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/attendance/class/${classId}/sessions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    }
  };

  const fetchSessionAttendance = async (classId, sessionNumber) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/attendance/session/${classId}/${sessionNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAttendanceList(response.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceList([]);
    }
  };

  const markAttendance = async (userId, isPresent, notes = "") => {
    try {
      const token = localStorage.getItem("token");

      if (!userId || userId === "undefined") {
        showNotification("❌ ID học viên không hợp lệ", "error");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/attendance/mark",
        {
          classId: selectedClass._id,
          userId,
          sessionNumber: selectedSession.sessionNumber,
          isPresent,
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh attendance list
      fetchSessionAttendance(selectedClass._id, selectedSession.sessionNumber);
      showNotification("✅ Điểm danh thành công!");
    } catch (error) {
      console.error("Error marking attendance:", error);
      showNotification("❌ Lỗi khi điểm danh", "error");
    }
  };

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out z-50 ${
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  };

  const filteredAttendance = attendanceList.filter(
    (record) =>
      record.userId?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      record.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Thêm function này
  const handleClassSelect = async (classItem) => {
    setSelectedClass(classItem);
    await fetchClassSessions(classItem._id);
    await fetchPaidStudentsInfo(classItem._id);
  };

  // Thêm function reset tạm thời
  const resetAttendanceCollection = async () => {
    if (
      !window.confirm(
        "CẢNH BÁO: Điều này sẽ xóa toàn bộ dữ liệu điểm danh. Bạn có chắc chắn?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:5000/api/attendance/force-reset", {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification("✅ Đã reset database thành công!");

      // Reset states
      setSelectedClass(null);
      setSessions([]);
      setAttendanceList([]);
      setPaidStudentsInfo(null);

      // Refresh classes
      await fetchClasses();
    } catch (error) {
      console.error("Error resetting database:", error);
      showNotification("❌ Lỗi khi reset database", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với button reset */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý điểm danh
          </h1>
          <p className="text-gray-600">
            Điểm danh và theo dõi sự tham gia của học viên (chỉ học viên đã
            thanh toán)
          </p>
        </div>

        {/* BUTTON RESET TẠM THỜI */}
        <button
          onClick={resetAttendanceCollection}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ Reset Database
        </button>
      </div>

      {/* Classes Grid */}
      {!selectedClass && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <motion.div
              key={classItem._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleClassSelect(classItem)}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {classItem.className}
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users size={16} className="mr-2" />
                  <span>{classItem.currentMembers || 0} học viên</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>
                    Buổi {classItem.currentSession || 0}/
                    {classItem.totalSessions}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      classItem.status === "ongoing"
                        ? "bg-green-100 text-green-800"
                        : classItem.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {classItem.status === "ongoing"
                      ? "Đang diễn ra"
                      : classItem.status === "completed"
                      ? "Đã hoàn thành"
                      : "Sắp diễn ra"}
                  </span>
                </div>
              </div>

              {classItem.status !== "completed" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createSession(classItem._id);
                  }}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Tạo buổi học mới
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected Class Sessions */}
      {selectedClass && !selectedSession && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => {
                  setSelectedClass(null);
                  setSessions([]);
                  setPaidStudentsInfo(null);
                }}
                className="text-blue-600 hover:text-blue-700 mb-2"
              >
                ← Quay lại danh sách lớp
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedClass.className}
              </h2>
              <p className="text-gray-600">Chọn buổi học để điểm danh</p>

              {/* Hiển thị thông tin thanh toán */}
              {paidStudentsInfo && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">
                      {paidStudentsInfo.paidStudents} học viên đã thanh toán
                    </span>
                    {paidStudentsInfo.unpaidStudents > 0 && (
                      <span className="text-amber-600 ml-2">
                        ({paidStudentsInfo.unpaidStudents} chưa thanh toán -
                        không được điểm danh)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {selectedClass.status !== "completed" && (
              <button
                onClick={() => createSession(selectedClass._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Tạo buổi mới
              </button>
            )}
          </div>

          {/* Sessions list */}
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {selectedClass.status === "completed"
                  ? "Lớp học đã hoàn thành."
                  : paidStudentsInfo?.paidStudents === 0
                  ? "Không thể tạo buổi học khi chưa có học viên nào thanh toán."
                  : "Chưa có buổi học nào. Hãy tạo buổi học đầu tiên!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <motion.div
                  key={session.sessionNumber}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedSession(session);
                    fetchSessionAttendance(
                      selectedClass._id,
                      session.sessionNumber
                    );
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">
                      Buổi {session.sessionNumber}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {new Date(session.sessionDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Học viên đã TT:</span>
                      <span className="font-medium">
                        {session.totalStudents}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Có mặt:</span>
                      <span className="font-medium text-green-600">
                        {session.presentCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vắng mặt:</span>
                      <span className="font-medium text-red-600">
                        {session.totalStudents - session.presentCount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width:
                            session.totalStudents > 0
                              ? (session.presentCount / session.totalStudents) *
                                100
                              : 0,
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Attendance Management - giữ nguyên */}
      {selectedSession && (
        <div className="space-y-6">
          {/* Phần này giữ nguyên nhưng bỏ debug button */}
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => {
                  setSelectedSession(null);
                  setAttendanceList([]);
                }}
                className="text-blue-600 hover:text-blue-700 mb-2"
              >
                ← Quay lại danh sách buổi học
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedClass.className} - Buổi {selectedSession.sessionNumber}
              </h2>
              <p className="text-gray-600">
                {new Date(selectedSession.sessionDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Search và Attendance List giữ nguyên */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Danh sách điểm danh
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <div
                  key={record._id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        record.isPresent ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {record.userId?.username || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {record.userId?.email || "N/A"}
                      </p>
                      {record.checkinTime && (
                        <p className="text-xs text-gray-500">
                          Check-in:{" "}
                          {new Date(record.checkinTime).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => markAttendance(record.userId?._id, true)}
                      className={`px-3 py-1 rounded-lg text-sm flex items-center ${
                        record.isPresent
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700"
                      }`}
                      disabled={!record.userId?._id}
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Có mặt
                    </button>

                    <button
                      onClick={() => markAttendance(record.userId?._id, false)}
                      className={`px-3 py-1 rounded-lg text-sm flex items-center ${
                        !record.isPresent
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700"
                      }`}
                      disabled={!record.userId?._id}
                    >
                      <XCircle size={16} className="mr-1" />
                      Vắng mặt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
