import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  X,
  Search,
  Save,
  UserCheck,
  UserX,
  Plus
} from "lucide-react";

export default function AttendanceFlow() {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // View states: 'sessions' -> 'attendance'
  const [currentView, setCurrentView] = useState('sessions');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [classData, setClassData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [paidStudentsInfo, setPaidStudentsInfo] = useState(null);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkAttendanceMode, setBulkAttendanceMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [attendanceNotes, setAttendanceNotes] = useState({});

  // Helper functions
  const showNotification = (message, type = "success") => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const fetchClassData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/trainers/class/${classId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.class) {
        setClassData(response.data.class);
        console.log("Class data loaded:", response.data.class);
        return response.data.class; // Return the class data
      } else {
        console.warn("No class data found in response");
        return null;
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
      return null;
    }
  };

  const fetchPaidStudentsInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/attendance/class/${classId}/paid-students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaidStudentsInfo(response.data);
    } catch (error) {
      console.error("Error fetching paid students info:", error);
    }
  };

  const fetchSessionAttendance = async (sessionNumber) => {
    console.log("Fetching attendance for session number:", sessionNumber, "class:", classId);
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `http://localhost:5000/api/attendance/session/${classId}/${sessionNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Full attendance response:", response.data);
      
      // Handle different response formats
      let attendanceData = [];
      
      if (Array.isArray(response.data)) {
        // Response is directly an array
        attendanceData = response.data;
        console.log("Response is array format");
      } else if (response.data?.attendanceRecords) {
        attendanceData = response.data.attendanceRecords;
        console.log("Response has attendanceRecords property");
      } else if (response.data?.students) {
        attendanceData = response.data.students;
        console.log("Response has students property");
      } else if (response.data?.attendance) {
        attendanceData = response.data.attendance;
        console.log("Response has attendance property");
      } else if (response.data?.data) {
        attendanceData = response.data.data;
        console.log("Response has data property");
      }
      
      console.log("Parsed attendance data:", attendanceData);
      
      if (attendanceData && attendanceData.length > 0) {
        console.log("=== REAL ATTENDANCE DATA FOUND ===");
        console.log("Sample attendance record:", JSON.stringify(attendanceData[0], null, 2));
        console.log("Full attendance data:", attendanceData);
        setAttendanceList(attendanceData);
        console.log("Successfully loaded REAL attendance for", attendanceData.length, "students");
      } else {
        console.warn("=== NO REAL ATTENDANCE DATA - USING FALLBACK ===");
        console.log("Response data was:", response.data);
        await fetchEnrolledStudents();
      }
      
    } catch (error) {
      console.error("Error fetching session attendance:", error);
      console.log("Error response:", error.response?.data);
      
      // If session doesn't exist or any other error, try to get enrolled students
      console.log("Fetching enrolled students as fallback...");
      await fetchEnrolledStudents();
      
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      console.log("Fetching enrolled students for class:", classId);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `http://localhost:5000/api/classes/${classId}/enrolled-students`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Enrolled students response:", response.data);
      
      if (response.data?.students) {
        console.log("Raw enrolled students:", response.data.students);
        console.log("Sample enrolled student:", response.data.students[0]);
        
        // Convert enrolled students to attendance format
        const attendanceRecords = response.data.students.map(student => {
          console.log("Processing student:", student);
          console.log("Student fields:", Object.keys(student));
          
          return {
            studentId: student._id,
            isPresent: false, // Default to not present for new sessions
            userId: student, // Put full student object here for consistency
            student: student, // Also keep as student for fallback
            notes: ""
          };
        });
        
        console.log("Created attendance records:", attendanceRecords);
        console.log("Sample attendance record:", attendanceRecords[0]);
        setAttendanceList(attendanceRecords);
        console.log("Loaded", attendanceRecords.length, "enrolled students");
      } else {
        console.warn("No enrolled students found");
        setAttendanceList([]);
      }
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      showNotification("❌ Lỗi khi tải danh sách học viên đã đăng ký", "error");
      setAttendanceList([]);
    }
  };

  const generateClassSchedule = (inputClassData = null) => {
    const classDataToUse = inputClassData || classData;
    
    if (!classDataToUse) {
      console.log("No classData available for schedule generation");
      return [];
    }

    console.log("Generating schedule for class:", classDataToUse);

    // Use default dates if not provided
    const startDate = classDataToUse.startDate ? new Date(classDataToUse.startDate) : new Date();
    const endDate = classDataToUse.endDate ? new Date(classDataToUse.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const schedule = classDataToUse.schedule || "";
    
    console.log("Schedule string:", schedule);
    console.log("Date range:", startDate, "to", endDate);
    
    // Parse schedule to get days of week
    const scheduleDays = [];
    
    // Handle both formats: "T2,T4" and "Thứ 2, Thứ 4"
    if (schedule.includes('T2') || schedule.includes('Thứ 2') || schedule.includes('Monday')) scheduleDays.push(1); // Monday
    if (schedule.includes('T3') || schedule.includes('Thứ 3') || schedule.includes('Tuesday')) scheduleDays.push(2); // Tuesday  
    if (schedule.includes('T4') || schedule.includes('Thứ 4') || schedule.includes('Wednesday')) scheduleDays.push(3); // Wednesday
    if (schedule.includes('T5') || schedule.includes('Thứ 5') || schedule.includes('Thursday')) scheduleDays.push(4); // Thursday
    if (schedule.includes('T6') || schedule.includes('Thứ 6') || schedule.includes('Friday')) scheduleDays.push(5); // Friday
    if (schedule.includes('T7') || schedule.includes('Thứ 7') || schedule.includes('Saturday')) scheduleDays.push(6); // Saturday
    if (schedule.includes('CN') || schedule.includes('Chủ nhật') || schedule.includes('Sunday')) scheduleDays.push(0); // Sunday

    console.log("Parsed schedule days:", scheduleDays);

    if (scheduleDays.length === 0) {
      console.log("No valid schedule days found, using default Monday/Wednesday");
      scheduleDays.push(1, 3);
    }

    const sessions = [];
    let sessionNumber = 1;
    let currentDate = new Date(startDate);
    const maxSessions = classDataToUse.totalSessions || 12;

    console.log("Starting session generation with max sessions:", maxSessions);

    // Generate sessions based on schedule
    let loopCounter = 0;
    while (currentDate <= endDate && sessionNumber <= maxSessions && loopCounter < 100) {
      loopCounter++;
      const dayOfWeek = currentDate.getDay();
      
      if (scheduleDays.includes(dayOfWeek)) {
        sessions.push({
          sessionNumber: sessionNumber,
          sessionDate: new Date(currentDate),
          totalStudents: paidStudentsInfo?.paidStudents || 0,
          presentCount: 0,
          isFromSchedule: true
        });
        console.log(`Generated session ${sessionNumber} for ${currentDate.toLocaleDateString('vi-VN')}`);
        sessionNumber++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("Generated scheduled sessions:", sessions);
    return sessions;
  };

  const fetchClassSessions = async (inputClassData = null) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/attendance/class/${classId}/sessions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dbSessions = response.data.sessions || [];
      
      // Filter out any invalid sessions
      const validDbSessions = dbSessions.filter(session => 
        session && session.sessionNumber && session.sessionDate
      );
      
      // Generate scheduled sessions with the class data
      const scheduledSessions = generateClassSchedule(inputClassData);
      
      // Create a map to track sessions by date to avoid duplicates
      const sessionsByDate = new Map();
      
      // First, add all database sessions (these are real sessions with attendance data)
      validDbSessions.forEach(session => {
        const dateKey = new Date(session.sessionDate).toDateString();
        sessionsByDate.set(dateKey, {
          ...session,
          isFromDatabase: true
        });
      });
      
      // Then add scheduled sessions only if no session exists for that date
      scheduledSessions.forEach(scheduledSession => {
        const dateKey = new Date(scheduledSession.sessionDate).toDateString();
        if (!sessionsByDate.has(dateKey)) {
          sessionsByDate.set(dateKey, {
            ...scheduledSession,
            isFromSchedule: true
          });
        }
      });
      
      // Convert map back to array and sort by date
      const allSessions = Array.from(sessionsByDate.values());
      
      // Sort by date first, then by session number
      allSessions.sort((a, b) => {
        const dateA = new Date(a.sessionDate);
        const dateB = new Date(b.sessionDate);
        if (dateA.getTime() === dateB.getTime()) {
          return a.sessionNumber - b.sessionNumber;
        }
        return dateA - dateB;
      });
      
      console.log("Scheduled sessions:", scheduledSessions);
      console.log("Database sessions:", validDbSessions);
      console.log("Merged sessions (no duplicates):", allSessions);
      
      setSessions(allSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      // If API fails, still show scheduled sessions
      const scheduledSessions = generateClassSchedule(inputClassData);
      setSessions(scheduledSessions);
    }
  };

  const initializeAttendanceFlow = async () => {
    try {
      setLoading(true);
      
      // Fetch class data first
      const classResult = await fetchClassData();
      
      // Fetch paid students info
      await fetchPaidStudentsInfo();
      
      // Then fetch sessions with the class data
      await fetchClassSessions(classResult);
    } catch (error) {
      console.error("Error initializing attendance flow:", error);
      showNotification("❌ Lỗi khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      initializeAttendanceFlow();
    }
  }, [classId]);

  // Show loading screen for sessions view
  if (loading && currentView === 'sessions') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center relative z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const handleBackToClasses = () => {
    navigate('/trainer/classes');
  };

  const handleBackToSessions = () => {
    setCurrentView('sessions');
    setSelectedSession(null);
    setSearchTerm("");
    setBulkAttendanceMode(false);
    setSelectedStudents([]);
  };

  const markAttendance = async (userId, isPresent, notes = "") => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/attendance/mark",
        {
          classId,
          userId,
          sessionNumber: selectedSession.sessionNumber,
          isPresent,
          notes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchSessionAttendance(selectedSession.sessionNumber);
      await fetchClassSessions();
      showNotification(`✅ Đã ${isPresent ? "điểm danh" : "hủy điểm danh"} thành công!`);
    } catch (error) {
      console.error("Error marking attendance:", error);
      showNotification("❌ Lỗi khi điểm danh", "error");
    }
  };

  const handleSessionSelect = async (session) => {
    console.log("Selecting session:", session);
    
    // Check if session date is in the past (before today)
    const sessionDate = new Date(session.sessionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sessionDate.setHours(0, 0, 0, 0);
    
    // Allow attendance for today and past sessions, but prevent future sessions
    if (sessionDate > today) {
      showNotification("⚠️ Không thể điểm danh cho buổi học chưa đến", "warning");
      return;
    }
    
    try {
      setLoading(true);
      setSelectedSession(session);
      setCurrentView('attendance');
      
      // If this is a scheduled session that doesn't exist in database yet, create it
      if (session.isFromSchedule && !session.isFromDatabase) {
        console.log("Creating new session in database...");
        await createSessionInDatabase(session);
      }
      
      // Always fetch fresh attendance data
      console.log("Fetching attendance for session:", session.sessionNumber);
      await fetchSessionAttendance(session.sessionNumber);
      
    } catch (error) {
      console.error("Error selecting session:", error);
      showNotification("❌ Lỗi khi tải dữ liệu buổi học", "error");
    } finally {
      setLoading(false);
    }
  };

  const createSessionInDatabase = async (sessionData) => {
    try {
      const token = localStorage.getItem("token");
      
      console.log("Creating session in database:", {
        classId,
        sessionNumber: sessionData.sessionNumber,
        sessionDate: sessionData.sessionDate.toISOString()
      });
      
      await axios.post(
        "http://localhost:5000/api/attendance/session",
        { 
          classId,
          sessionNumber: sessionData.sessionNumber,
          sessionDate: sessionData.sessionDate.toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await axios.put(
        `http://localhost:5000/api/attendance/class/${classId}/session`,
        { currentSession: sessionData.sessionNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Session created successfully in database");
    } catch (error) {
      console.error("Error creating session in database:", error);
    }
  };

  const markBulkAttendance = async (isPresent) => {
    try {
      const token = localStorage.getItem("token");
      const promises = selectedStudents.map(userId =>
        axios.post(
          "http://localhost:5000/api/attendance/mark",
          {
            classId,
            userId,
            sessionNumber: selectedSession.sessionNumber,
            isPresent,
            notes: "",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);
      await fetchSessionAttendance(selectedSession.sessionNumber);
      await fetchClassSessions();
      setSelectedStudents([]);
      showNotification(`✅ Đã ${isPresent ? "điểm danh" : "đánh dấu vắng"} ${selectedStudents.length} học viên!`);
    } catch (error) {
      console.error("Error bulk marking attendance:", error);
      showNotification("❌ Lỗi khi điểm danh hàng loạt", "error");
    }
  };

  // Filter attendance based on search term
  const filteredAttendance = attendanceList.filter((record) => {
    if (!record) return false;
    
    // Handle different data structures
    const student = record.userId || record.student || record;
    const name = student?.fullname || student?.fullName || student?.name || student?.studentName || '';
    const username = student?.username || student?.email || '';
    
    const searchLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchLower) || 
           username.toLowerCase().includes(searchLower);
  });

  // Attendance Row Component
  const AttendanceRow = ({ record, bulkMode, isSelected, onToggleSelect, onMarkAttendance, attendanceNotes, setAttendanceNotes }) => {
    const isPresent = record.isPresent;
    const [localNotes, setLocalNotes] = useState(record.notes || "");
    
    // Handle different student data structures
    const student = record.userId || record.student || record;
    const studentId = student?._id || student?.id || record.studentId;
    
    // Debug logging to see actual data structure
    console.log("Full record:", record);
    console.log("Extracted student:", student);
    console.log("Available student fields:", Object.keys(student || {}));
    console.log("Full student object:", JSON.stringify(student, null, 2));
    console.log("student.fullname:", student?.fullname);
    console.log("student.fullName:", student?.fullName);
    console.log("student.name:", student?.name);
    
    const studentName = student?.fullname || student?.fullName || student?.name || student?.studentName || 'Không có tên';
    const studentEmail = student?.email || student?.studentEmail || student?.username || '@unknow';
    
    console.log("Final studentName:", studentName);
    console.log("Final studentEmail:", studentEmail);
    
    console.log("AttendanceRow student data:", { student, studentId, studentName, studentEmail });
    const [showNotes, setShowNotes] = useState(false);

    const handleNotesSubmit = () => {
      setAttendanceNotes(prev => ({
        ...prev,
        [studentId]: localNotes
      }));
      onMarkAttendance(studentId, isPresent, localNotes);
      setShowNotes(false);
    };

    return (
      <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {bulkMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-medium text-blue-600">
                    {studentName?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{studentName}</h4>
                  <p className="text-sm text-gray-500">{studentEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notes button */}
            {(record.notes || showNotes) && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Ghi chú"
              >
                <Save className="h-4 w-4" />
              </button>
            )}

            {/* Attendance buttons */}
            <button
              onClick={() => onMarkAttendance(studentId, true, localNotes)}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                isPresent === true
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600 hover:bg-green-50"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>Có mặt</span>
            </button>

            <button
              onClick={() => onMarkAttendance(studentId, false, localNotes)}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                isPresent === false
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600 hover:bg-red-50"
              }`}
            >
              <X className="h-4 w-4" />
              <span>Vắng</span>
            </button>
          </div>
        </div>

        {/* Notes section */}
        {showNotes && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={localNotes}
                onChange={(e) => setLocalNotes(e.target.value)}
                placeholder="Thêm ghi chú..."
                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleNotesSubmit}
                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Lưu
              </button>
              <button
                onClick={() => setShowNotes(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Existing notes display */}
        {record.notes && !showNotes && (
          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <span className="font-medium">Ghi chú:</span> {record.notes}
          </div>
        )}
      </div>
    );
  };

  // Session Selection View
  const SessionSelectionView = () => (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToClasses}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">Quay lại lớp học</span>
                </button>
                <div className="border-l border-gray-300 pl-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {classData?.className} - Điểm danh
                  </h1>
                  <p className="text-sm text-gray-600">
                    Chọn ngày học để tiến hành điểm danh
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{sessions.length}</span> buổi học
                </div>
              </div>
            </div>
          </div>

          {/* Class Info */}
          {classData && (
            <div className="p-6 bg-blue-50 border-b border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Học viên đã đóng tiền</p>
                    <p className="font-semibold text-blue-900">{paidStudentsInfo?.paidStudents || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Lịch học</p>
                    <p className="font-semibold text-blue-900">{classData.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Thời gian</p>
                    <p className="font-semibold text-blue-900">
                      {classData.startDate && classData.endDate 
                        ? `${new Date(classData.startDate).toLocaleDateString('vi-VN')} - ${new Date(classData.endDate).toLocaleDateString('vi-VN')}`
                        : "Chưa xác định"
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Grid */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải buổi học...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có buổi học nào</h3>
                <p className="text-gray-600 mb-4">Lịch học sẽ được tạo tự động dựa trên thời gian biểu của lớp</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => {
                  const sessionDate = new Date(session.sessionDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  sessionDate.setHours(0, 0, 0, 0);
                  
                  const isToday = sessionDate.getTime() === today.getTime();
                  const isPast = sessionDate < today;
                  const isFuture = sessionDate > today;
                  const canTakeAttendance = !isFuture; // Can take attendance for today and past
                  
                  return (
                    <motion.div
                      key={session.sessionNumber}
                      whileHover={canTakeAttendance ? { scale: 1.02 } : {}}
                      whileTap={canTakeAttendance ? { scale: 0.98 } : {}}
                      onClick={() => canTakeAttendance && handleSessionSelect(session)}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        !canTakeAttendance 
                          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                          : isToday
                            ? "border-green-300 bg-green-50 shadow-lg cursor-pointer"
                            : isPast
                              ? session.presentCount > 0
                                ? "border-blue-300 bg-blue-50 shadow-md cursor-pointer"
                                : "border-gray-300 bg-gray-100 cursor-pointer"
                              : "border-gray-300 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer"
                      }`}
                    >
                      {/* Session number and date */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isFuture
                            ? "bg-gray-200 text-gray-600"
                            : isToday 
                              ? "bg-green-200 text-green-800" 
                              : isPast
                                ? session.presentCount > 0
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-gray-300 text-gray-700"
                                : "bg-gray-200 text-gray-700"
                        }`}>
                          Buổi {session.sessionNumber}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {session.isFromSchedule && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Tự động
                            </span>
                          )}
                          
                          {/* Status indicator */}
                          {isPast && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                              Đã qua
                            </span>
                          )}
                          {isToday && (
                            <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded">
                              Hôm nay
                            </span>
                          )}
                          {isFuture && (
                            <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded">
                              Sắp tới
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Session info */}
                      <div className="space-y-3">
                        <div>
                          <p className={`font-medium ${
                            isFuture
                              ? "text-gray-500"
                              : isToday ? "text-green-900" : isPast ? "text-gray-700" : "text-gray-900"
                          }`}>
                            {sessionDate.toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </p>
                          <p className={`text-sm ${
                            isFuture ? "text-gray-400" : "text-gray-600"
                          }`}>
                            {sessionDate.toLocaleDateString('vi-VN')}
                          </p>
                        </div>

                        {/* Attendance stats */}
                        <div className="flex items-center justify-between text-sm">
                          <span className={isFuture ? "text-gray-400" : "text-gray-600"}>
                            Có mặt: <span className={`font-medium ${
                              isFuture ? "text-gray-500" : "text-gray-800"
                            }`}>{session.presentCount || 0}</span>
                          </span>
                          <span className={isFuture ? "text-gray-400" : "text-gray-600"}>
                            Tổng: <span className={`font-medium ${
                              isFuture ? "text-gray-500" : "text-gray-800"
                            }`}>{session.totalStudents || 0}</span>
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              isFuture
                                ? "bg-gray-300"
                                : isToday ? "bg-green-500" : isPast ? "bg-blue-500" : "bg-blue-500"
                            }`}
                            style={{ 
                              width: `${session.totalStudents > 0 ? ((session.presentCount || 0) / session.totalStudents) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        
                        <div className="text-center mt-2">
                          <span className={`text-sm font-medium ${
                            isFuture
                              ? "text-gray-500"
                              : isToday ? "text-green-700" : isPast ? "text-blue-700" : "text-blue-700"
                          }`}>
                            {isFuture
                              ? "Chưa đến ngày học"
                              : isToday
                                ? session.presentCount > 0 
                                  ? "Xem & sửa điểm danh"
                                  : "Bắt đầu điểm danh"
                                : isPast
                                  ? session.presentCount > 0
                                    ? "Xem điểm danh đã lưu"
                                    : "Điểm danh bổ sung"
                                  : "Bắt đầu điểm danh"
                            }
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Attendance Form View
  const AttendanceFormView = () => (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToSessions}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">Quay lại lịch ngày học</span>
                </button>
                <div className="border-l border-gray-300 pl-3">
                  <h1 className="text-xl font-bold text-gray-900">
                    {classData?.className} - {selectedSession?.sessionDate && new Date(selectedSession.sessionDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Điểm danh học viên cho ngày học này
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setBulkAttendanceMode(!bulkAttendanceMode)}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    bulkAttendanceMode
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>{bulkAttendanceMode ? "Hủy chọn hàng loạt" : "Chọn hàng loạt"}</span>
                </button>
                
                {bulkAttendanceMode && selectedStudents.length > 0 && (
                  <>
                    <button
                      onClick={() => markBulkAttendance(true)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Có mặt ({selectedStudents.length})</span>
                    </button>
                    <button
                      onClick={() => markBulkAttendance(false)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Vắng ({selectedStudents.length})</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm học viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {bulkAttendanceMode && (
            <div className="bg-blue-50 border-b border-blue-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  Đã chọn {selectedStudents.length} học viên
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedStudents(filteredAttendance.map(r => {
                      const student = r.userId || r.student || r;
                      return student?._id || student?.id || r.studentId;
                    }).filter(id => id))}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Chọn tất cả
                  </button>
                  <button
                    onClick={() => setSelectedStudents([])}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attendance List */}
          <div>
            <div className="px-6 py-3 bg-gray-50 border-b">
              <h3 className="font-semibold text-gray-800">
                Danh sách điểm danh ({filteredAttendance.length})
              </h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Đang tải...</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredAttendance.map((record) => {
                  const student = record.userId || record.student || record;
                  const studentId = student?._id || student?.id || record.studentId;
                  
                  return (
                    <AttendanceRow 
                      key={studentId || Math.random()} 
                      record={record}
                      bulkMode={bulkAttendanceMode}
                      isSelected={selectedStudents.includes(studentId)}
                      onToggleSelect={() => {
                        if (studentId) {
                          setSelectedStudents(prev => 
                            prev.includes(studentId)
                              ? prev.filter(id => id !== studentId)
                              : [...prev, studentId]
                          );
                        }
                      }}
                      onMarkAttendance={markAttendance}
                      attendanceNotes={attendanceNotes}
                      setAttendanceNotes={setAttendanceNotes}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative z-50">
      {currentView === 'sessions' && <SessionSelectionView />}
      {currentView === 'attendance' && <AttendanceFormView />}
    </div>
  );
}