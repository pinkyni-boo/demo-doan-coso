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
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [classMembers, setClassMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

  const [formData, setFormData] = useState({
    className: "",
    serviceId: "",
    serviceName: "",
    instructorName: "",
    description: "",
    maxMembers: 20,
    totalSessions: 12,
    price: 0,
    startDate: "",
    endDate: "",
    schedule: [],
    location: "Phòng tập chính",
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
      const [classesRes, servicesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/classes"),
        axios.get("http://localhost:5000/api/services"),
      ]);

      setClasses(classesRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("❌ Không thể tải dữ liệu", "error");
      setClasses([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showNotification("❌ Vui lòng đăng nhập lại", "error");
        return;
      }

      const submitData = {
        ...formData,
        serviceId: formData.serviceId, // Gửi serviceId để backend xử lý
        maxMembers: parseInt(formData.maxMembers),
        totalSessions: parseInt(formData.totalSessions),
        price: parseInt(formData.price),
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
      instructorName: "",
      description: "",
      maxMembers: 20,
      totalSessions: 12,
      price: 0,
      startDate: "",
      endDate: "",
      schedule: [],
      location: "Phòng tập chính",
      requirements: "",
    });
    setEditingClass(null);
    setShowForm(false);
  };

  const handleEdit = (classItem) => {
    setFormData({
      ...classItem,
      serviceId: classItem.service?._id || classItem.service || "", // Xử lý cả trường hợp populated và không populated
      startDate: classItem.startDate
        ? new Date(classItem.startDate).toISOString().split("T")[0]
        : "",
      endDate: classItem.endDate
        ? new Date(classItem.endDate).toISOString().split("T")[0]
        : "",
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
              className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
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
                      Huấn luyện viên
                    </label>
                    <input
                      type="text"
                      value={formData.instructorName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instructorName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                      Ngày bắt đầu *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
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
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
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
                  <span>{classItem.instructorName || "Chưa có HLV"}</span>
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
                  <span>{classItem.location || "Phòng tập chính"}</span>
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
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
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
