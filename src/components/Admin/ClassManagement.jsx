import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  User,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Search,
  X,
  Dumbbell, // Thêm import này
  Save,
  CheckCircle,
} from "lucide-react";

export default function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [services, setServices] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [classMembers, setClassMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  // State cho kiểm tra trùng lịch HLV
  const [scheduleConflict, setScheduleConflict] = useState(null);
  const [checkingSchedule, setCheckingSchedule] = useState(false);

  const [formData, setFormData] = useState({
    className: "",
    serviceId: "",
    serviceName: "",
    instructorId: "",
    instructorName: "",
    description: "",
    maxMembers: 20,
    totalSessions: 12,
    price: 0,
    startDate: "",
    endDate: "",
    schedule: [],
    roomId: "",
    roomName: "",
    location: "",
    requirements: "",
  });

  const daysOfWeek = [
    { value: 1, label: "Thứ 2" },
    { value: 2, label: "Thứ 3" },
    { value: 3, label: "Thứ 4" },
    { value: 4, label: "Thứ 5" },
    { value: 5, label: "Thứ 6" },
    { value: 6, label: "Thứ 7" },
    { value: 0, label: "Chủ nhật" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const [classesRes, servicesRes, trainersRes, roomsRes] =
        await Promise.all([
          axios.get("http://localhost:5000/api/classes"),
          axios.get("http://localhost:5000/api/services"),
          axios.get("http://localhost:5000/api/trainers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/rooms", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      setClasses(classesRes.data || []);
      setServices(servicesRes.data || []);
      setTrainers(trainersRes.data || []);
      setRooms(roomsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("❌ Không thể tải dữ liệu", "error");
      setClasses([]);
      setServices([]);
      setTrainers([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm kiểm tra trùng lịch HLV
  const checkTrainerScheduleConflict = async () => {
    if (
      !formData.instructorName ||
      !formData.schedule ||
      formData.schedule.length === 0
    ) {
      setScheduleConflict(null);
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setScheduleConflict(null);
      return;
    }

    // Validate schedule data
    const hasInvalidSlot = formData.schedule.some(
      (slot) => !slot.startTime || !slot.endTime
    );
    if (hasInvalidSlot) {
      setScheduleConflict(null);
      return;
    }

    setCheckingSchedule(true);

    try {
      const token = localStorage.getItem("token");

      // Chuyển đổi startDate/endDate từ dd/mm/yyyy sang ISO
      const convertToISO = (dateStr) => {
        if (!dateStr) return "";
        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(datePattern);
        if (match) {
          const [, day, month, year] = match;
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
        return dateStr;
      };

      const params = new URLSearchParams({
        trainerId: formData.instructorName,
        schedule: JSON.stringify(formData.schedule),
        startDate: convertToISO(formData.startDate),
        endDate: convertToISO(formData.endDate),
      });

      // Nếu đang edit lớp, loại trừ lớp hiện tại khỏi kiểm tra
      if (editingClass?._id) {
        params.append("excludeClassId", editingClass._id);
      }

      const response = await axios.get(
        `http://localhost:5000/api/trainers/check-schedule-conflict?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.hasConflict) {
        setScheduleConflict(response.data);
      } else {
        setScheduleConflict(null);
      }
    } catch (error) {
      console.error("Error checking trainer schedule:", error);
      showNotification("❌ Không thể kiểm tra lịch dạy HLV", "error");
    } finally {
      setCheckingSchedule(false);
    }
  };

  // Gọi kiểm tra khi thay đổi trainer, schedule, hoặc dates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkTrainerScheduleConflict();
    }, 800); // Debounce 800ms

    return () => clearTimeout(timeoutId);
  }, [
    formData.instructorName,
    JSON.stringify(formData.schedule),
    formData.startDate,
    formData.endDate,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra conflict trước khi submit
    if (scheduleConflict && scheduleConflict.hasConflict) {
      alert(
        "❌ KHÔNG THỂ TẠO/CẬP NHẬT LỚP HỌC\n\n" +
          "Lý do: Huấn luyện viên đã có lịch dạy trùng\n\n" +
          "Chi tiết:\n" +
          scheduleConflict.details +
          "\n\n💡 Vui lòng:\n" +
          "• Chọn thời gian khác cho lớp học\n" +
          "• Hoặc chọn huấn luyện viên khác"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showNotification("❌ Vui lòng đăng nhập lại", "error");
        return;
      }

      // Chuyển đổi ngày từ dd/mm/yyyy sang ISO format
      const convertToISO = (dateStr) => {
        if (!dateStr) return "";
        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(datePattern);
        if (match) {
          const [, day, month, year] = match;
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
        return dateStr; // Return as-is if not in dd/mm/yyyy format
      };

      const submitData = {
        ...formData,
        serviceId: formData.serviceId, // Gửi serviceId để backend xử lý
        maxMembers: parseInt(formData.maxMembers),
        totalSessions: parseInt(formData.totalSessions),
        price: parseInt(formData.price),
        startDate: convertToISO(formData.startDate),
        endDate: convertToISO(formData.endDate),
        // Only include location as that's what the Class model expects
        location: formData.location || formData.roomName,
      };

      if (editingClass) {
        await axios.put(
          `http://localhost:5000/api/classes/${editingClass._id}`,
          submitData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("✅ Cập nhật lớp học thành công!");
      } else {
        await axios.post("http://localhost:5000/api/classes", submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showNotification("✅ Thêm lớp học thành công!");
      }

      fetchData();
      resetForm();
    } catch (error) {
      console.error("Error saving class:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  const handleDelete = async (classId) => {
    if (!confirm("Bạn có chắc muốn xóa lớp học này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification("✅ Xóa lớp học thành công!");
      fetchData();
    } catch (error) {
      console.error("Error deleting class:", error);
      const errorMessage =
        error.response?.data?.message || "Không thể xóa lớp học";
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  const resetForm = () => {
    setFormData({
      className: "",
      serviceId: "",
      serviceName: "",
      instructorId: "",
      instructorName: "",
      description: "",
      maxMembers: 20,
      totalSessions: 12,
      price: 0,
      startDate: "",
      endDate: "",
      schedule: [],
      roomId: "",
      roomName: "",
      location: "",
      requirements: "",
    });
    setEditingClass(null);
    setShowForm(false);
    setScheduleConflict(null);
  };

  const handleEdit = (classItem) => {
    // Tìm trainer ID từ instructorName nếu có
    const trainer = trainers.find(
      (t) => t.fullName === classItem.instructorName
    );

    // Tìm room ID từ location hoặc roomName nếu có
    const room = rooms.find(
      (r) =>
        r.roomName === classItem.location ||
        r.roomName === classItem.roomName ||
        r._id === classItem.roomId
    );

    // Chuyển đổi ngày từ ISO format sang dd/mm/yyyy
    const convertToDisplayFormat = (dateStr) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    setFormData({
      ...classItem,
      serviceId: classItem.service?._id || classItem.service || "", // Xử lý cả trường hợp populated và không populated
      instructorId: trainer?._id || "", // Lấy ID của trainer từ name
      roomId: room?._id || classItem.roomId || "",
      roomName:
        room?.roomName || classItem.location || classItem.roomName || "",
      location: classItem.location || room?.roomName || "", // Ensure location is set
      startDate: convertToDisplayFormat(classItem.startDate),
      endDate: convertToDisplayFormat(classItem.endDate),
      schedule: classItem.schedule || [],
    });
    setEditingClass(classItem);
    setShowForm(true);
  };

  const addScheduleSlot = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        { dayOfWeek: 1, startTime: "", endTime: "" },
      ],
    });
  };

  const updateScheduleSlot = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = field === "dayOfWeek" ? parseInt(value) : value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeScheduleSlot = (index) => {
    const newSchedule = formData.schedule.filter((_, i) => i !== index);
    setFormData({ ...formData, schedule: newSchedule });
  };

  // Lọc huấn luyện viên theo dịch vụ đã chọn
  const getFilteredTrainers = () => {
    if (!formData.serviceId) {
      return trainers.filter((trainer) => trainer.status === "active");
    }

    return trainers.filter((trainer) => {
      return (
        trainer.status === "active" &&
        trainer.specialty &&
        (trainer.specialty._id === formData.serviceId ||
          trainer.specialty === formData.serviceId) // Handle both populated and non-populated cases
      );
    });
  };

  // Lấy tất cả huấn luyện viên active (cho trường hợp không có ai phù hợp)
  const getAllActiveTrainers = () => {
    return trainers.filter((trainer) => trainer.status === "active");
  };

  const showMembers = async (classId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/classes/${classId}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClassMembers(response.data || []);
      setShowMembersModal(true);
    } catch (error) {
      console.error("Error fetching class members:", error);
      showNotification("❌ Không thể tải danh sách học viên", "error");
      setClassMembers([]);
      setShowMembersModal(true);
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return "Chưa có lịch";
    return schedule
      .map((slot) => {
        const day = daysOfWeek.find((d) => d.value === slot.dayOfWeek);
        return `${day?.label || "N/A"}: ${slot.startTime || "N/A"}-${
          slot.endTime || "N/A"
        }`;
      })
      .join(", ");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "ongoing":
        return "Đang diễn ra";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const showNotification = (message, type = "success") => {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out z-50 ${
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  };

  // Filter classes
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.instructorName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || cls.status === statusFilter;
    const matchesService = !serviceFilter || cls.serviceName === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
          <p className="text-gray-600">
            Tạo và quản lý các lớp học trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm lớp học
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm lớp học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ongoing">Đang diễn ra</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả dịch vụ</option>
            {services.map((service) => (
              <option key={service._id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setServiceFilter("");
            }}
            className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} className="mr-2" />
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingClass ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên lớp học *
                    </label>
                    <input
                      type="text"
                      value={formData.className}
                      onChange={(e) =>
                        setFormData({ ...formData, className: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dịch vụ *
                    </label>
                    <select
                      value={formData.serviceId}
                      onChange={(e) => {
                        const selectedService = services.find(
                          (s) => s._id === e.target.value
                        );
                        setFormData({
                          ...formData,
                          serviceId: e.target.value,
                          serviceName: selectedService
                            ? selectedService.name
                            : "",
                          // Reset instructor khi thay đổi dịch vụ
                          instructorId: "",
                          instructorName: "",
                        });
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Chọn dịch vụ</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Huấn luyện viên{" "}
                      <span className="text-gray-500">(Tùy chọn)</span>
                    </label>
                    <select
                      value={formData.instructorId}
                      onChange={(e) => {
                        const selectedTrainer = trainers.find(
                          (trainer) => trainer._id === e.target.value
                        );
                        setFormData({
                          ...formData,
                          instructorId: e.target.value,
                          instructorName: selectedTrainer
                            ? selectedTrainer.fullName
                            : "",
                        });
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!formData.serviceId}
                    >
                      <option value="">
                        {!formData.serviceId
                          ? "-- Vui lòng chọn dịch vụ trước --"
                          : "-- Chọn huấn luyện viên (Tùy chọn) --"}
                      </option>

                      {/* Hiển thị huấn luyện viên phù hợp */}
                      {formData.serviceId &&
                        getFilteredTrainers().length > 0 && (
                          <>
                            <optgroup label="🎯 Phù hợp với dịch vụ">
                              {getFilteredTrainers().map((trainer) => (
                                <option key={trainer._id} value={trainer._id}>
                                  ✓ {trainer.fullName} - {trainer.experience}{" "}
                                  năm kinh nghiệm
                                </option>
                              ))}
                            </optgroup>
                          </>
                        )}

                      {/* Hiển thị tất cả huấn luyện viên khác nếu không có ai phù hợp */}
                      {formData.serviceId &&
                        getFilteredTrainers().length === 0 && (
                          <>
                            <option
                              value=""
                              disabled
                              style={{ color: "#f59e0b", fontStyle: "italic" }}
                            >
                              ⚠️ Không có HLV phù hợp - Hiển thị tất cả HLV
                              khác:
                            </option>
                            {getAllActiveTrainers().map((trainer) => (
                              <option key={trainer._id} value={trainer._id}>
                                ⚡ {trainer.fullName} - {trainer.experience} năm
                                kinh nghiệm (Khác chuyên môn)
                              </option>
                            ))}
                          </>
                        )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.serviceId ? (
                        getFilteredTrainers().length > 0 ? (
                          <>
                            <span className="text-green-600 font-medium">
                              ✓ {getFilteredTrainers().length} huấn luyện viên
                              có chuyên môn phù hợp
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-orange-600 font-medium">
                              ⚠️ Không có HLV phù hợp - Hiển thị{" "}
                              {getAllActiveTrainers().length} HLV khác
                            </span>
                          </>
                        )
                      ) : (
                        "Chọn dịch vụ trước để xem huấn luyện viên phù hợp."
                      )}
                    </p>

                    {/* Conflict Check Indicator */}
                    {checkingSchedule && (
                      <div className="mt-2 flex items-center text-sm text-blue-600">
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang kiểm tra lịch dạy...
                      </div>
                    )}

                    {!checkingSchedule &&
                      scheduleConflict &&
                      scheduleConflict.hasConflict && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg">
                          <div className="flex items-start">
                            <svg
                              className="h-5 w-5 text-red-500 mr-2 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-800">
                                ⚠️ Trùng lịch dạy!
                              </p>
                              <p className="text-xs text-red-700 mt-1">
                                {scheduleConflict.details ||
                                  "Huấn luyện viên đã có lịch dạy trùng với lịch bạn chọn."}
                              </p>
                              <p className="text-xs text-red-600 mt-2 font-medium">
                                Vui lòng chọn thời gian khác hoặc chọn HLV khác.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {!checkingSchedule &&
                      scheduleConflict &&
                      !scheduleConflict.hasConflict &&
                      formData.instructorId &&
                      formData.schedule.length > 0 && (
                        <div className="mt-2 flex items-center text-sm text-green-600">
                          <svg
                            className="h-4 w-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          ✓ Lịch dạy hợp lệ - không có trung lịch
                        </div>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng tối đa *
                    </label>
                    <input
                      type="number"
                      value={formData.maxMembers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxMembers: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tổng số buổi *
                    </label>
                    <input
                      type="number"
                      value={formData.totalSessions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalSessions: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá (VND) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu *{" "}
                      <span className="text-gray-500 text-xs">
                        (dd/mm/yyyy)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={formData.startDate}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Chỉ cho phép nhập số và dấu /
                        value = value.replace(/[^\d/]/g, "");

                        // Tự động thêm dấu / sau ngày và tháng
                        if (value.length === 2 && !value.includes("/")) {
                          value = value + "/";
                        } else if (
                          value.length === 5 &&
                          value.split("/").length === 2
                        ) {
                          value = value + "/";
                        }

                        // Giới hạn độ dài
                        if (value.length <= 10) {
                          setFormData({ ...formData, startDate: value });
                        }
                      }}
                      onBlur={(e) => {
                        // Validate format dd/mm/yyyy khi blur
                        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                        const match = e.target.value.match(datePattern);
                        if (match) {
                          const day = parseInt(match[1]);
                          const month = parseInt(match[2]);
                          const year = parseInt(match[3]);

                          if (day < 1 || day > 31 || month < 1 || month > 12) {
                            alert("Ngày hoặc tháng không hợp lệ!");
                            setFormData({ ...formData, startDate: "" });
                          }
                        } else if (e.target.value && !match) {
                          alert(
                            "Định dạng ngày không hợp lệ! Vui lòng nhập theo định dạng dd/mm/yyyy"
                          );
                          setFormData({ ...formData, startDate: "" });
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc *{" "}
                      <span className="text-gray-500 text-xs">
                        (dd/mm/yyyy)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="dd/mm/yyyy"
                      value={formData.endDate}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Chỉ cho phép nhập số và dấu /
                        value = value.replace(/[^\d/]/g, "");

                        // Tự động thêm dấu / sau ngày và tháng
                        if (value.length === 2 && !value.includes("/")) {
                          value = value + "/";
                        } else if (
                          value.length === 5 &&
                          value.split("/").length === 2
                        ) {
                          value = value + "/";
                        }

                        // Giới hạn độ dài
                        if (value.length <= 10) {
                          setFormData({ ...formData, endDate: value });
                        }
                      }}
                      onBlur={(e) => {
                        // Validate format dd/mm/yyyy khi blur
                        const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                        const match = e.target.value.match(datePattern);
                        if (match) {
                          const day = parseInt(match[1]);
                          const month = parseInt(match[2]);
                          const year = parseInt(match[3]);

                          if (day < 1 || day > 31 || month < 1 || month > 12) {
                            alert("Ngày hoặc tháng không hợp lệ!");
                            setFormData({ ...formData, endDate: "" });
                          }
                        } else if (e.target.value && !match) {
                          alert(
                            "Định dạng ngày không hợp lệ! Vui lòng nhập theo định dạng dd/mm/yyyy"
                          );
                          setFormData({ ...formData, endDate: "" });
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phòng tập
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => {
                      const selectedRoom = rooms.find(
                        (room) => room._id === e.target.value
                      );
                      setFormData({
                        ...formData,
                        roomId: e.target.value,
                        roomName: selectedRoom ? selectedRoom.roomName : "",
                        location: selectedRoom ? selectedRoom.roomName : "", // This is what gets saved to the database
                      });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn phòng tập</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomCode} - {room.roomName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Schedule Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Lịch tập hàng tuần
                    </label>
                    <button
                      type="button"
                      onClick={addScheduleSlot}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center"
                    >
                      <Plus size={16} className="mr-1" />
                      Thêm buổi
                    </button>
                  </div>

                  {formData.schedule.map((slot, index) => (
                    <div
                      key={index}
                      className="flex gap-3 mb-3 items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <select
                        value={slot.dayOfWeek}
                        onChange={(e) =>
                          updateScheduleSlot(index, "dayOfWeek", e.target.value)
                        }
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {daysOfWeek.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateScheduleSlot(index, "startTime", e.target.value)
                        }
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />

                      <span className="text-gray-500">đến</span>

                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateScheduleSlot(index, "endTime", e.target.value)
                        }
                        className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() => removeScheduleSlot(index)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    {editingClass ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <motion.div
            key={classItem._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {classItem.className}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    classItem.status
                  )}`}
                >
                  {getStatusText(classItem.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Dumbbell size={16} className="mr-2 text-gray-400" />
                  <span>{classItem.serviceName || "N/A"}</span>
                </div>
                <div className="flex items-center">
                  <User size={16} className="mr-2 text-gray-400" />
                  {classItem.instructorName ? (
                    <span className="text-green-600 font-medium">
                      {classItem.instructorName}
                    </span>
                  ) : (
                    <span className="text-orange-600 font-medium italic">
                      Chưa gán HLV
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-2 text-gray-400" />
                  <span>
                    {classItem.currentMembers || 0}/{classItem.maxMembers} học
                    viên
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <span>{classItem.totalSessions} buổi</span>
                </div>
                <div className="flex items-center">
                  <DollarSign size={16} className="mr-2 text-gray-400" />
                  <span>{classItem.price?.toLocaleString() || 0} VND</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span>
                    {classItem.roomName ||
                      classItem.location ||
                      "Chưa chọn phòng"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>{formatSchedule(classItem.schedule)}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <p>
                  Thời gian:{" "}
                  {classItem.startDate
                    ? new Date(classItem.startDate).toLocaleDateString()
                    : "N/A"}{" "}
                  -{" "}
                  {classItem.endDate
                    ? new Date(classItem.endDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => showMembers(classItem._id)}
                  className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
                >
                  <Eye size={16} className="mr-1" />
                  Xem học viên
                </button>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(classItem)}
                    className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors text-sm"
                  >
                    <Edit2 size={16} className="mr-1" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(classItem._id)}
                    className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 size={16} className="mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            {classes.length === 0
              ? "Chưa có lớp học nào"
              : "Không tìm thấy lớp học phù hợp"}
          </p>
        </div>
      )}

      {/* Members Modal */}
      <AnimatePresence>
        {showMembersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Danh sách học viên</h2>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {classMembers.length > 0 ? (
                <div className="space-y-3">
                  {classMembers.map((member, index) => (
                    <div
                      key={member._id || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {member.user?.username || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {member.user?.email || "N/A"}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-gray-600">
                          Đăng ký:{" "}
                          {member.enrollmentDate
                            ? new Date(
                                member.enrollmentDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p
                          className={`font-medium ${
                            member.paymentStatus
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        >
                          {member.paymentStatus ? (
                            <span className="flex items-center">
                              <CheckCircle size={16} className="mr-1" />
                              Đã thanh toán
                            </span>
                          ) : (
                            "Chờ thanh toán"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Chưa có học viên nào đăng ký</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
