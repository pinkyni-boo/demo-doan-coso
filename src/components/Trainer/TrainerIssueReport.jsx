import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Camera,
  MapPin,
  Wrench,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const TrainerIssueReport = () => {
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    reportType: "equipment",
    equipmentId: "",
    roomId: "",
    issueType: "malfunction",
    title: "",
    description: "",
    severity: "medium",
    images: [],
  });

  // Fetch initial data
  useEffect(() => {
    fetchRooms();
    fetchEquipment();
    fetchMyReports();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Lỗi khi tải danh sách phòng tập");
    }
  };

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/equipment", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle different response structures
      const equipmentData =
        response.data.data?.equipment ||
        response.data.data ||
        response.data ||
        [];
      console.log("Equipment data fetched:", equipmentData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Lỗi khi tải danh sách thiết bị");
    }
  };

  const fetchMyReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/issue-reports/my-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyReports(response.data.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleSubmit = async (e) => {
    // Prevent all form submission behaviors
    e.preventDefault();
    e.stopPropagation();

    // Prevent double submission
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Validate required fields
      if (formData.reportType === "equipment" && !formData.equipmentId) {
        toast.error("Vui lòng chọn thiết bị");
        return;
      }

      if (formData.reportType === "room" && !formData.roomId) {
        toast.error("Vui lòng chọn phòng tập");
        return;
      }

      if (!formData.title.trim()) {
        toast.error("Vui lòng nhập tiêu đề");
        return;
      }

      if (!formData.description.trim()) {
        toast.error("Vui lòng nhập mô tả chi tiết");
        return;
      }

      // Prepare form data with images
      const submitData = new FormData();

      // Add text fields
      Object.keys(formData).forEach((key) => {
        if (key !== "images") {
          submitData.append(key, formData[key]);
        }
      });

      // Add image files
      formData.images.forEach((image, index) => {
        if (image.file) {
          submitData.append("images", image.file);
        }
      });

      const response = await axios.post("/api/issue-reports", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Success handling
      toast.success("Đã gửi báo cáo thành công!");
      setShowForm(false);
      setFormData({
        reportType: "equipment",
        equipmentId: "",
        roomId: "",
        issueType: "malfunction",
        title: "",
        description: "",
        severity: "medium",
        images: [],
      });

      // Refresh reports list after a short delay to avoid conflicts
      setTimeout(() => {
        fetchMyReports();
      }, 500);
    } catch (error) {
      console.error("Error submitting report:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Lỗi khi gửi báo cáo. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "reported":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "acknowledged":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "in_progress":
        return <Wrench className="w-4 h-4 text-orange-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      reported: "Đã báo cáo",
      acknowledged: "Đã xác nhận",
      in_progress: "Đang xử lý",
      resolved: "Đã giải quyết",
      rejected: "Từ chối",
    };
    return statusMap[status] || status;
  };

  // Get available rooms for selected equipment
  const getAvailableRooms = () => {
    if (!formData.equipmentId) {
      return rooms; // Show all rooms if no equipment selected
    }

    const selectedEquipment = equipment.find(
      (item) => item._id === formData.equipmentId
    );
    if (!selectedEquipment || !selectedEquipment.room) {
      return rooms; // Show all rooms if equipment has no room assigned
    }

    // Filter rooms to show only the room where the equipment is located
    return rooms.filter(
      (room) =>
        room._id === selectedEquipment.room._id ||
        room._id === selectedEquipment.room
    );
  };

  const getSeverityColor = (severity) => {
    const colorMap = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colorMap[severity] || "bg-gray-100 text-gray-800";
  };

  const getSeverityText = (severity) => {
    const severityMap = {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
      critical: "Nghiêm trọng",
    };
    return severityMap[severity] || severity;
  };

  const handleImageUpload = (e) => {
    e.preventDefault();
    const files = Array.from(e.target.files);

    if (files.length + formData.images.length > 5) {
      toast.error("Chỉ được upload tối đa 5 hình ảnh");
      return;
    }

    if (files.length === 0) {
      return;
    }

    // Convert files to base64 for preview and storage
    Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          // Validate file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`File ${file.name} quá lớn. Tối đa 5MB.`);
            reject(new Error("File too large"));
            return;
          }

          // Validate file type
          if (!file.type.startsWith("image/")) {
            toast.error(`File ${file.name} không phải là hình ảnh.`);
            reject(new Error("Invalid file type"));
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file: file,
              preview: e.target.result,
              name: file.name,
              size: file.size,
            });
          };
          reader.onerror = () => {
            reject(new Error("Failed to read file"));
          };
          reader.readAsDataURL(file);
        });
      })
    )
      .then((imageData) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...imageData],
        }));
        // Clear the input
        e.target.value = "";
      })
      .catch((error) => {
        console.error("Error uploading images:", error);
      });
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="p-6 pt-24 max-w-7xl mx-auto">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="text-gray-700">Đang gửi báo cáo...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Báo cáo vấn đề
        </h1>
        <p className="text-gray-600">
          Báo cáo vấn đề về thiết bị hoặc phòng tập để admin xử lý
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Báo cáo vấn đề mới
        </button>
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Tạo báo cáo vấn đề</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại báo cáo
              </label>
              <select
                value={formData.reportType}
                onChange={(e) =>
                  setFormData({ ...formData, reportType: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="equipment">Thiết bị</option>
                <option value="room">Phòng tập</option>
                <option value="facility">Cơ sở vật chất</option>
              </select>
            </div>

            {/* Equipment/Room Selection */}
            {formData.reportType === "equipment" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thiết bị
                  </label>
                  <select
                    value={formData.equipmentId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        equipmentId: e.target.value,
                        roomId: "", // Clear room selection when equipment changes
                      });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn thiết bị</option>
                    {equipment.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.equipmentCode} - {item.equipmentName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Room selection - only show when equipment is selected */}
                {formData.equipmentId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phòng tập (nơi đặt thiết bị)
                    </label>
                    <select
                      value={formData.roomId}
                      onChange={(e) =>
                        setFormData({ ...formData, roomId: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Chọn phòng tập</option>
                      {getAvailableRooms().map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.roomCode} - {room.roomName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {formData.reportType === "room" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng tập
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({ ...formData, roomId: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
            )}

            {/* Issue Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại vấn đề
              </label>
              <select
                value={formData.issueType}
                onChange={(e) =>
                  setFormData({ ...formData, issueType: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="malfunction">Hỏng hóc</option>
                <option value="damage">Hư hại</option>
                <option value="wear">Mài mòn</option>
                <option value="safety_concern">Vấn đề an toàn</option>
                <option value="needs_cleaning">Cần vệ sinh</option>
                <option value="needs_repair">Cần sửa chữa</option>
                <option value="not_working">Không hoạt động</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Mô tả ngắn gọn vấn đề"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Mô tả chi tiết vấn đề gặp phải"
                required
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ nghiêm trọng
              </label>
              <select
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="critical">Nghiêm trọng</option>
              </select>
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh bằng chứng (tối đa 5 ảnh){" "}
                {formData.images.length > 0 &&
                  `- Đã chọn ${formData.images.length} ảnh`}
              </label>

              {/* Upload Button */}
              <div className="mb-4">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors">
                  <Camera className="w-4 h-4" />
                  Chọn hình ảnh
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={formData.images.length >= 5}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB mỗi ảnh.
                </p>
              </div>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                        {image.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4" />
                {loading ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Reports */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Báo cáo của tôi</h2>
        </div>

        <div className="p-6">
          {myReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có báo cáo nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReports.map((report) => (
                <div
                  key={report._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        {report.reportType === "equipment" &&
                          report.equipment && (
                            <span className="flex items-center gap-1">
                              <Wrench className="w-4 h-4" />
                              {report.equipment.equipmentCode} -{" "}
                              {report.equipment.equipmentName}
                              {report.equipment.brand &&
                                ` (${report.equipment.brand})`}
                              {report.equipment.quantity &&
                                ` - SL: ${report.equipment.quantity}`}
                            </span>
                          )}
                        {report.reportType === "room" && report.room && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {report.room.roomCode} - {report.room.roomName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                          report.severity
                        )}`}
                      >
                        {getSeverityText(report.severity)}
                      </span>
                      <div className="flex items-center gap-1 text-sm">
                        {getStatusIcon(report.status)}
                        {getStatusText(report.status)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{report.description}</p>

                  {/* Display Images if any */}
                  {report.images && report.images.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Hình ảnh bằng chứng:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {report.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative group cursor-pointer"
                          >
                            <img
                              src={image.url || image.preview}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:opacity-75 transition-opacity"
                              onClick={() =>
                                window.open(
                                  image.url || image.preview,
                                  "_blank"
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Báo cáo lúc:{" "}
                      {new Date(report.createdAt).toLocaleString("vi-VN")}
                    </span>
                    {report.acknowledgedAt && (
                      <span>
                        Xác nhận lúc:{" "}
                        {new Date(report.acknowledgedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    )}
                  </div>

                  {report.adminNotes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Ghi chú từ admin:</strong> {report.adminNotes}
                      </p>
                    </div>
                  )}

                  {report.resolutionNotes && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Kết quả xử lý:</strong> {report.resolutionNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerIssueReport;
