import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, AlertTriangle, DollarSign } from "lucide-react";

const EditMaintenanceModal = ({ isOpen, onClose, maintenance, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    estimatedDuration: 2,
    maintenanceType: "routine",
    priority: "medium",
    estimatedCost: 0,
    technician: {
      name: "",
      phone: "",
      email: "",
      company: "",
    },
  });

  const [loading, setLoading] = useState(false);

  // Initialize form when maintenance data changes
  useEffect(() => {
    if (maintenance) {
      const scheduleDate = new Date(maintenance.scheduledDate);
      const formattedDate = scheduleDate.toISOString().slice(0, 16); // Format for datetime-local input

      setFormData({
        title: maintenance.title || "",
        description: maintenance.description || "",
        scheduledDate: formattedDate,
        estimatedDuration: maintenance.estimatedDuration || 2,
        maintenanceType: maintenance.maintenanceType || "routine",
        priority: maintenance.priority || "medium",
        estimatedCost: maintenance.estimatedCost || 0,
        technician: {
          name: maintenance.assignedTo?.technician?.name || "",
          phone: maintenance.assignedTo?.technician?.phone || "",
          email: maintenance.assignedTo?.technician?.email || "",
          company: maintenance.assignedTo?.technician?.company || "",
        },
      });
    }
  }, [maintenance]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("technician.")) {
      const techField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        technician: {
          ...prev.technician,
          [techField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        alert("Vui lòng nhập tiêu đề");
        return;
      }

      if (!formData.scheduledDate) {
        alert("Vui lòng chọn ngày thực hiện");
        return;
      }

      if (!formData.estimatedDuration || formData.estimatedDuration <= 0) {
        alert("Thời lượng dự kiến phải lớn hơn 0");
        return;
      }

      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        scheduledDate: formData.scheduledDate,
        estimatedDuration: Number(formData.estimatedDuration),
        maintenanceType: formData.maintenanceType,
        priority: formData.priority,
        estimatedCost: Number(formData.estimatedCost) || 0,
        technician: {
          name: formData.technician.name.trim(),
          phone: formData.technician.phone.trim(),
          email: formData.technician.email.trim(),
          company: formData.technician.company.trim(),
        },
      };

      await onUpdate(maintenance._id, updateData);
      onClose();
    } catch (error) {
      console.error("Error updating maintenance:", error);
      alert("Có lỗi xảy ra khi cập nhật lịch bảo trì");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Chỉnh sửa lịch bảo trì
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Two columns layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Ngày thực hiện *
              </label>
              <input
                type="datetime-local"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Thời lượng (giờ) *
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration || ""}
                onChange={handleInputChange}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Maintenance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại bảo trì
              </label>
              <select
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="routine">Bảo trì định kỳ</option>
                <option value="repair">Sửa chữa</option>
                <option value="replacement">Thay thế</option>
                <option value="inspection">Kiểm tra</option>
                <option value="emergency">Khẩn cấp</option>
                <option value="preventive">Phòng ngừa</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Mức độ ưu tiên
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>

            {/* Estimated Cost */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Chi phí dự kiến (VNĐ)
              </label>
              <input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost || ""}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Technician Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Thông tin kỹ thuật viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên kỹ thuật viên
                </label>
                <input
                  type="text"
                  name="technician.name"
                  value={formData.technician.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="technician.phone"
                  value={formData.technician.phone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="technician.email"
                  value={formData.technician.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công ty
                </label>
                <input
                  type="text"
                  name="technician.company"
                  value={formData.technician.company}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMaintenanceModal;
