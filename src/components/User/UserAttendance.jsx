import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";

export default function UserAttendance() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    if (userData._id) {
      fetchAttendanceReport(userData._id);
    } else {
      setError("Không tìm thấy thông tin user");
      setLoading(false);
    }
  }, []);

  const fetchAttendanceReport = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      const response = await axios.get(
        `http://localhost:5000/api/attendance/user/${userId}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error fetching attendance report:", error);

      // Handle different types of errors
      if (error.response?.status === 404) {
        setError("Chưa có dữ liệu điểm danh");
        setAttendanceData({
          attendanceRecords: [],
          totalSessions: 0,
          attendedSessions: 0,
          missedSessions: 0,
          attendanceRate: 0,
        });
      } else if (error.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn");
        toast.error("Vui lòng đăng nhập lại");
      } else {
        setError("Không thể tải báo cáo điểm danh");
        toast.error("Lỗi khi tải dữ liệu điểm danh");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (user?._id) {
      fetchAttendanceReport(user._id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải báo cáo điểm danh...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <AlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{error}</h3>
            <p className="text-gray-500 mb-4">
              Có lỗi xảy ra khi tải dữ liệu điểm danh
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!attendanceData || attendanceData.totalSessions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có dữ liệu điểm danh
            </h3>
            <p className="text-gray-500">
              Bạn chưa tham gia lớp học nào hoặc chưa có buổi học nào được điểm
              danh
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header không đổi */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Báo cáo điểm danh của tôi
          </h1>
          <p className="text-gray-600">
            Theo dõi sự tham gia và tiến độ học tập của bạn
          </p>
        </div>

        {/* Statistics Cards - thêm số buổi còn lại */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tổng buổi học
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceData.totalSessions}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Có mặt</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendanceData.attendedSessions}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vắng mặt</p>
                <p className="text-2xl font-bold text-red-600">
                  {attendanceData.missedSessions}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Thêm card số buổi còn lại */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Còn lại</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.max(
                    0,
                    (attendanceData.totalPlannedSessions ||
                      attendanceData.totalSessions) -
                      attendanceData.totalSessions
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tỷ lệ tham gia
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {attendanceData.attendanceRate}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Attendance Records không đổi */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Lịch sử điểm danh
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {attendanceData.attendanceRecords.map((record) => (
              <motion.div
                key={record._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        record.isPresent ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {record.classId?.className || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Buổi {record.sessionNumber} -{" "}
                        {record.classId?.serviceName || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-900">
                      {new Date(record.sessionDate).toLocaleDateString("vi-VN")}
                    </p>
                    <div className="flex items-center mt-1">
                      {record.isPresent ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600 font-medium">
                            Có mặt
                          </span>
                          {record.checkinTime && (
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(record.checkinTime).toLocaleTimeString(
                                "vi-VN"
                              )}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm text-red-600 font-medium">
                            Vắng mặt
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-2 pl-8">
                    <p className="text-sm text-gray-600 italic">
                      Ghi chú: {record.notes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
