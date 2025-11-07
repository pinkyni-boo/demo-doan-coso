import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Search,
  Filter,
  Download,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Activity,
} from "lucide-react";

const AttendanceManagementAdmin = () => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, sessions, students, trainers
  const [attendanceList, setAttendanceList] = useState([]);
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    present: 0,
    absent: 0,
    attendanceRate: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    date: "",
    classId: "",
    trainerId: "",
    userId: "",
    status: "all",
    page: 1,
    limit: 20,
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "overview") {
      fetchAttendanceList();
    }
  }, [filters, activeTab]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch students, trainers, classes for filters
      const [studentsRes, trainersRes, classesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/attendance/admin/students", {
          headers,
        }),
        axios.get("http://localhost:5000/api/attendance/admin/trainers", {
          headers,
        }),
        axios.get("http://localhost:5000/api/classes", { headers }),
      ]);

      setStudents(studentsRes.data.students || []);
      setTrainers(trainersRes.data.trainers || []);
      setClasses(classesRes.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchAttendanceList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(
        `http://localhost:5000/api/attendance/admin/list?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAttendanceList(response.data.data || []);
        setStatistics(response.data.statistics || {});
      }
    } catch (error) {
      console.error("Error fetching attendance list:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReport = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/attendance/admin/student/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedStudent(response.data);
      }
    } catch (error) {
      console.error("Error fetching student report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerReport = async (trainerName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/attendance/admin/trainer/${encodeURIComponent(
          trainerName
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedTrainer(response.data);
      }
    } catch (error) {
      console.error("Error fetching trainer report:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetail = async (classId, sessionNumber) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/attendance/admin/session/${classId}/${sessionNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSelectedSession(response.data.session);
      }
    } catch (error) {
      console.error("Error fetching session detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tổng điểm danh</p>
            <p className="text-2xl font-bold text-gray-900">
              {statistics.total}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Có mặt</p>
            <p className="text-2xl font-bold text-green-600">
              {statistics.present}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Vắng mặt</p>
            <p className="text-2xl font-bold text-red-600">
              {statistics.absent}
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <UserX className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tỷ lệ điểm danh</p>
            <p className="text-2xl font-bold text-amber-600">
              {statistics.attendanceRate}%
            </p>
          </div>
          <div className="bg-amber-100 p-3 rounded-lg">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Bộ lọc
        </h3>
        <button
          onClick={() => {
            setFilters({
              date: "",
              classId: "",
              trainerId: "",
              userId: "",
              status: "all",
              page: 1,
              limit: 20,
            });
          }}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Date filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Class filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lớp học
          </label>
          <select
            value={filters.classId}
            onChange={(e) =>
              setFilters({ ...filters, classId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Tất cả lớp</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>

        {/* Student filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Học viên
          </label>
          <select
            value={filters.userId}
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Tất cả học viên</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Trainer filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trainer
          </label>
          <select
            value={filters.trainerId}
            onChange={(e) =>
              setFilters({ ...filters, trainerId: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Tất cả trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer._id} value={trainer.fullName}>
                {trainer.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="all">Tất cả</option>
            <option value="present">Có mặt</option>
            <option value="absent">Vắng mặt</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <div>
      {renderStatCards()}
      {renderFilters()}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách điểm danh
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : attendanceList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Không có dữ liệu điểm danh</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Lớp học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Buổi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trainer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Giờ điểm danh
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceList.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.sessionDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.classId?.className || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Buổi {record.sessionNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.userId?.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.classId?.instructorName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.isPresent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Có mặt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-4 w-4 mr-1" />
                          Vắng mặt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkinTime
                        ? new Date(record.checkinTime).toLocaleTimeString(
                            "vi-VN"
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Danh sách học viên
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div
              key={student._id}
              onClick={() => {
                fetchStudentReport(student._id);
                setActiveTab("student-detail");
              }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {student.fullName}
                  </h4>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                {student.attendanceRate < 70 && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">Tổng buổi</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {student.totalSessions}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Có mặt</p>
                  <p className="text-lg font-semibold text-green-600">
                    {student.presentCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vắng</p>
                  <p className="text-lg font-semibold text-red-600">
                    {student.absentCount}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Tỷ lệ chuyên cần</span>
                  <span
                    className={`font-semibold ${
                      student.attendanceRate >= 80
                        ? "text-green-600"
                        : student.attendanceRate >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {student.attendanceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      student.attendanceRate >= 80
                        ? "bg-green-500"
                        : student.attendanceRate >= 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${student.attendanceRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrainersTab = () => (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Danh sách Trainer
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trainers.map((trainer) => (
            <div
              key={trainer._id}
              onClick={() => {
                fetchTrainerReport(trainer.fullName);
                setActiveTab("trainer-detail");
              }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {trainer.fullName}
                  </h4>
                  <p className="text-xs text-gray-500">{trainer.role}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{trainer.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Số lớp:</span>
                  <span className="text-gray-900 font-semibold">
                    {trainer.classCount}
                  </span>
                </div>
              </div>

              <button className="mt-3 w-full py-2 px-4 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors text-sm font-medium">
                Xem chi tiết <ChevronRight className="h-4 w-4 inline ml-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudentDetail = () => {
    if (!selectedStudent) return null;

    return (
      <div>
        <button
          onClick={() => setActiveTab("students")}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Quay lại danh sách
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedStudent.student.name}
              </h3>
              <p className="text-gray-600">{selectedStudent.student.email}</p>
            </div>
            {selectedStudent.summary.warning && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {selectedStudent.summary.warning}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Tổng buổi học</p>
              <p className="text-2xl font-bold text-blue-700">
                {selectedStudent.summary.totalSessions}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Có mặt</p>
              <p className="text-2xl font-bold text-green-700">
                {selectedStudent.summary.presentCount}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Vắng mặt</p>
              <p className="text-2xl font-bold text-red-700">
                {selectedStudent.summary.absentCount}
              </p>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <p className="text-sm text-amber-600">Tỷ lệ chuyên cần</p>
              <p className="text-2xl font-bold text-amber-700">
                {selectedStudent.summary.attendanceRate}%
              </p>
            </div>
          </div>

          {/* Class summary */}
          {selectedStudent.classSummary &&
            selectedStudent.classSummary.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Thống kê theo lớp
                </h4>
                <div className="space-y-3">
                  {selectedStudent.classSummary.map((cls) => (
                    <div
                      key={cls.classId}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">
                          {cls.className}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {cls.instructorName}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                        <div>
                          <p className="text-gray-500">Tổng</p>
                          <p className="font-semibold">{cls.totalSessions}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Có mặt</p>
                          <p className="font-semibold text-green-600">
                            {cls.presentCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Vắng</p>
                          <p className="font-semibold text-red-600">
                            {cls.absentCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tỷ lệ</p>
                          <p className="font-semibold text-amber-600">
                            {cls.attendanceRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Attendance history */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Lịch sử điểm danh
            </h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Lớp học
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Buổi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                      Giờ điểm danh
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedStudent.attendanceHistory.map((record, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.className}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        Buổi {record.sessionNumber}
                      </td>
                      <td className="px-4 py-3">
                        {record.isPresent ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Có mặt
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Vắng mặt
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {record.checkinTime
                          ? new Date(record.checkinTime).toLocaleTimeString(
                              "vi-VN"
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrainerDetail = () => {
    if (!selectedTrainer) return null;

    return (
      <div>
        <button
          onClick={() => setActiveTab("trainers")}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Quay lại danh sách
        </button>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedTrainer.trainer.name}
              </h3>
              <p className="text-gray-600">{selectedTrainer.trainer.email}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                {selectedTrainer.trainer.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Tổng số lớp</p>
              <p className="text-2xl font-bold text-blue-700">
                {selectedTrainer.summary.totalClasses}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Buổi đã điểm danh</p>
              <p className="text-2xl font-bold text-green-700">
                {selectedTrainer.summary.totalSessionsHeld}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600">Tổng học viên điểm danh</p>
              <p className="text-2xl font-bold text-purple-700">
                {selectedTrainer.summary.totalStudentsPresent}
              </p>
            </div>
          </div>

          {/* Missing sessions warning */}
          {selectedTrainer.summary.missingSessions && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Phát hiện buổi học thiếu điểm danh
                  </h4>
                  <div className="space-y-2">
                    {selectedTrainer.summary.missingSessions.map(
                      (missing, index) => (
                        <div key={index} className="text-sm text-red-800">
                          <span className="font-medium">
                            {missing.className}:
                          </span>{" "}
                          Thiếu {missing.missingSessions} buổi (Đã tổ chức:{" "}
                          {missing.heldSessions}/{missing.expectedSessions})
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Classes detail */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Chi tiết các lớp
            </h4>
            <div className="space-y-4">
              {selectedTrainer.classes.map((cls) => (
                <div
                  key={cls.classId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {cls.className}
                      </h5>
                      <p className="text-sm text-gray-500">
                        {cls.service} - {cls.location}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        cls.status === "ongoing"
                          ? "bg-green-100 text-green-800"
                          : cls.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {cls.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-3 text-center text-sm">
                    <div>
                      <p className="text-gray-500">Tổng buổi</p>
                      <p className="font-semibold">{cls.totalSessions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Buổi hiện tại</p>
                      <p className="font-semibold">{cls.currentSession}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Đã điểm danh</p>
                      <p className="font-semibold text-green-600">
                        {cls.sessionsHeld}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Học viên điểm danh</p>
                      <p className="font-semibold text-purple-600">
                        {cls.totalStudentsPresent}
                      </p>
                    </div>
                  </div>

                  {/* Sessions */}
                  {cls.sessions && cls.sessions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Các buổi đã điểm danh:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cls.sessions.map((session) => (
                          <div
                            key={session.sessionNumber}
                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                          >
                            Buổi {session.sessionNumber}: {session.presentCount}
                            /{session.totalStudents}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Quản lý điểm danh
        </h1>
        <p className="text-gray-600">
          Xem và quản lý tất cả hoạt động điểm danh trong hệ thống
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Activity className="h-5 w-5 inline mr-2" />
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "students" || activeTab === "student-detail"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Users className="h-5 w-5 inline mr-2" />
            Học viên
          </button>
          <button
            onClick={() => setActiveTab("trainers")}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "trainers" || activeTab === "trainer-detail"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Award className="h-5 w-5 inline mr-2" />
            Trainer
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "students" && renderStudentsTab()}
        {activeTab === "student-detail" && renderStudentDetail()}
        {activeTab === "trainers" && renderTrainersTab()}
        {activeTab === "trainer-detail" && renderTrainerDetail()}
      </div>
    </div>
  );
};

export default AttendanceManagementAdmin;
