import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  Users,
  Search,
  Calendar,
  MapPin,
  Save,
  RotateCcw,
  User
} from "lucide-react";

export default function AttendanceCheck() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [sessionData, setSessionData] = useState({
    sessionNumber: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("No token found");
        return;
      }

      // Lấy thông tin lớp học từ API
      const response = await axios.get(`http://localhost:5000/api/trainers/class/${classId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const classData = response.data.class;
      setClassData({
        id: classId,
        className: classData.className,
        service: classData.service,
        schedule: classData.schedule,
        location: classData.location,
        currentSession: classData.currentSession || 1,
        totalSessions: classData.totalSessions || 12
      });

      setStudents(classData.students?.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        avatar: null,
        lastAttendance: new Date().toISOString().split('T')[0]
      })) || []);

      setSessionData({
        sessionNumber: (classData.currentSession || 0) + 1,
        date: new Date().toISOString().split('T')[0],
        notes: ""
      });

      // Initialize attendance state
      const initialAttendance = {};
      (classData.students || []).forEach(student => {
        initialAttendance[student.id] = null; // null = chưa chọn, true = có mặt, false = vắng
      });
      setAttendance(initialAttendance);

    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback to empty data
      setClassData(null);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      // Validate that all students have attendance marked
      const unmarkedStudents = Object.entries(attendance).filter(([_, status]) => status === null);
      if (unmarkedStudents.length > 0) {
        alert("Vui lòng điểm danh cho tất cả học viên!");
        return;
      }

      const attendanceData = {
        classId: classId,
        sessionNumber: sessionData.sessionNumber,
        date: sessionData.date,
        notes: sessionData.notes,
        attendance: Object.entries(attendance).map(([studentId, status]) => ({
          studentId: parseInt(studentId),
          present: status,
          timestamp: new Date().toISOString()
        }))
      };

      console.log("Submitting attendance:", attendanceData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Điểm danh đã được lưu thành công!");
      navigate(-1);
      
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Có lỗi xảy ra khi lưu điểm danh!");
    } finally {
      setSaving(false);
    }
  };

  const resetAttendance = () => {
    const resetState = {};
    students.forEach(student => {
      resetState[student.id] = null;
    });
    setAttendance(resetState);
  };

  const markAllPresent = () => {
    const allPresentState = {};
    students.forEach(student => {
      allPresentState[student.id] = true;
    });
    setAttendance(allPresentState);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendance).filter(status => status === true).length;
    const absent = Object.values(attendance).filter(status => status === false).length;
    const unmarked = total - present - absent;
    
    return { total, present, absent, unmarked };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Điểm danh</h1>
                <p className="text-gray-600">{classData?.className} • Buổi {sessionData.sessionNumber}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetAttendance}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Đặt lại
              </button>
              <button
                onClick={markAllPresent}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Tất cả có mặt
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || stats.unmarked > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Đang lưu..." : "Lưu điểm danh"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Class Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngày học</p>
                <input
                  type="date"
                  value={sessionData.date}
                  onChange={(e) => setSessionData({...sessionData, date: e.target.value})}
                  className="font-medium text-gray-900 border rounded px-2 py-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Địa điểm</p>
                <p className="font-medium text-gray-900">{classData?.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="font-medium text-gray-900">{classData?.schedule}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-2">Ghi chú buổi học</label>
            <textarea
              value={sessionData.notes}
              onChange={(e) => setSessionData({...sessionData, notes: e.target.value})}
              placeholder="Nhập ghi chú về buổi học..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Có mặt</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <Check className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vắng mặt</p>
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <X className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chưa điểm danh</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unmarked}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách học viên ({filteredStudents.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => {
              const attendanceStatus = attendance[student.id];
              
              return (
                <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-xs text-gray-500">
                          Lần cuối: {new Date(student.lastAttendance).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAttendanceChange(student.id, true)}
                        className={`px-6 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                          attendanceStatus === true
                            ? "bg-green-600 border-green-600 text-white shadow-lg"
                            : "border-green-300 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        <Check className="h-5 w-5 inline mr-2" />
                        Có mặt
                      </button>
                      
                      <button
                        onClick={() => handleAttendanceChange(student.id, false)}
                        className={`px-6 py-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                          attendanceStatus === false
                            ? "bg-red-600 border-red-600 text-white shadow-lg"
                            : "border-red-300 text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <X className="h-5 w-5 inline mr-2" />
                        Vắng mặt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {stats.unmarked === 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center">
              <Check className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h4 className="text-lg font-medium text-green-900">Điểm danh hoàn tất!</h4>
                <p className="text-green-700">
                  Đã điểm danh {stats.present} có mặt, {stats.absent} vắng mặt trên tổng số {stats.total} học viên.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}