import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Dumbbell,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Settings,
  Activity,
  Wrench,
  X,
} from "lucide-react";

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRoom, setFilterRoom] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add', 'edit', 'view'
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const [formData, setFormData] = useState({
    equipmentName: "",
    equipmentCode: "",
    category: "cardio",
    brand: "",
    quantity: "",
    purchaseDate: "",
    purchasePrice: "",
    room: "",
    status: "active",
    condition: "excellent",
    warranty: "",
    description: "",
  });

  const categories = [
    { value: "cardio", label: "Cardio" },
    { value: "strength", label: "Sức mạnh" },
    { value: "functional", label: "Chức năng" },
    { value: "accessory", label: "Phụ kiện" },
    { value: "other", label: "Khác" },
  ];

  const conditions = [
    { value: "excellent", label: "Tuyệt vời" },
    { value: "good", label: "Tốt" },
    { value: "fair", label: "Khá" },
    { value: "poor", label: "Kém" },
    { value: "broken", label: "Hỏng" },
  ];

  const statuses = [
    { value: "active", label: "Hoạt động" },
    { value: "maintenance", label: "Bảo trì" },
    { value: "repair", label: "Sửa chữa" },
    { value: "retired", label: "Ngừng sử dụng" },
  ];

  useEffect(() => {
    fetchEquipment();
    fetchRooms();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/equipment", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipment(response.data.data?.equipment || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast.error("Lỗi khi tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const equipmentData = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
      };

      let response;
      if (modalType === "edit" && selectedEquipment) {
        response = await axios.put(
          `/api/equipment/${selectedEquipment._id}`,
          equipmentData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Cập nhật thiết bị thành công!");
      } else {
        response = await axios.post("/api/equipment", equipmentData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Thêm thiết bị thành công!");
      }

      setShowModal(false);
      resetForm();
      fetchEquipment();
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast.error(error.response?.data?.message || "Lỗi khi lưu thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (equipmentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/equipment/${equipmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Xóa thiết bị thành công!");
      fetchEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Lỗi khi xóa thiết bị");
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedEquipment(item);
    if (item) {
      setFormData({
        equipmentName: item.equipmentName || "",
        equipmentCode: item.equipmentCode || "",
        category: item.category || "cardio",
        brand: item.brand || "",
        quantity: item.quantity || "",
        purchaseDate: item.purchaseDate
          ? new Date(item.purchaseDate).toISOString().split("T")[0]
          : "",
        purchasePrice: item.purchasePrice || "",
        room: item.room?._id || "",
        status: item.status || "active",
        condition: item.condition || "excellent",
        warranty: item.warranty || "",
        description: item.description || "",
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      equipmentName: "",
      equipmentCode: "",
      category: "cardio",
      brand: "",
      quantity: "",
      purchaseDate: "",
      purchasePrice: "",
      room: "",
      status: "active",
      condition: "excellent",
      warranty: "",
      description: "",
    });
    setSelectedEquipment(null);
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipmentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || item.category === filterCategory;

    const matchesRoom = filterRoom === "all" || item.room?._id === filterRoom;

    return matchesSearch && matchesCategory && matchesRoom;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      repair: "bg-red-100 text-red-800",
      retired: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getConditionColor = (condition) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-orange-100 text-orange-800",
      broken: "bg-red-100 text-red-800",
    };
    return colors[condition] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Dumbbell className="h-8 w-8 text-amber-600" />
          Quản lý thiết bị
        </h1>
        <p className="text-gray-600">
          Quản lý thiết bị tập luyện và dụng cụ trong phòng gym
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã, thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Room Filter */}
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tất cả phòng</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomName}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={() => openModal("add")}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm thiết bị
          </button>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Dumbbell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không có thiết bị nào</p>
          </div>
        ) : (
          filteredEquipment.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {item.equipmentName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Mã: {item.equipmentCode}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openModal("view", item)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openModal("edit", item)}
                      className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Status and Condition */}
                <div className="flex gap-2 mb-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {statuses.find((s) => s.value === item.status)?.label ||
                      item.status}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(
                      item.condition
                    )}`}
                  >
                    {conditions.find((c) => c.value === item.condition)
                      ?.label || item.condition}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>
                      {categories.find((c) => c.value === item.category)?.label}
                    </span>
                  </div>
                  {item.brand && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>
                        {item.brand} {item.quantity && `- SL: ${item.quantity}`}
                      </span>
                    </div>
                  )}
                  {item.room && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{item.room.roomName}</span>
                    </div>
                  )}
                  {item.purchaseDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(item.purchaseDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  )}
                  {item.purchasePrice && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.purchasePrice)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-50">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {modalType === "add"
                    ? "Thêm thiết bị mới"
                    : modalType === "edit"
                    ? "Chỉnh sửa thiết bị"
                    : "Chi tiết thiết bị"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {modalType === "view" ? (
                // View Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên thiết bị
                      </label>
                      <p className="text-gray-900">{formData.equipmentName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã thiết bị
                      </label>
                      <p className="text-gray-900">{formData.equipmentCode}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Danh mục
                      </label>
                      <p className="text-gray-900">
                        {
                          categories.find((c) => c.value === formData.category)
                            ?.label
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trạng thái
                      </label>
                      <p className="text-gray-900">
                        {
                          statuses.find((s) => s.value === formData.status)
                            ?.label
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thương hiệu
                      </label>
                      <p className="text-gray-900">{formData.brand}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượng
                      </label>
                      <p className="text-gray-900">{formData.quantity}</p>
                    </div>
                  </div>

                  {formData.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                      </label>
                      <p className="text-gray-900">{formData.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Edit/Add Mode
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên thiết bị *
                      </label>
                      <input
                        type="text"
                        value={formData.equipmentName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            equipmentName: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã thiết bị *
                      </label>
                      <input
                        type="text"
                        value={formData.equipmentCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            equipmentCode: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phòng
                      </label>
                      <select
                        value={formData.room}
                        onChange={(e) =>
                          setFormData({ ...formData, room: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">Chọn phòng</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>
                            {room.roomName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thương hiệu
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        {statuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tình trạng
                      </label>
                      <select
                        value={formData.condition}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            condition: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        {conditions.map((condition) => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày mua
                      </label>
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchaseDate: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá mua
                      </label>
                      <input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            purchasePrice: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bảo hành
                    </label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) =>
                        setFormData({ ...formData, warranty: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="VD: 2 năm, 12 tháng..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Mô tả chi tiết về thiết bị..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-6 border-t">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {loading
                        ? "Đang lưu..."
                        : modalType === "edit"
                        ? "Cập nhật"
                        : "Thêm mới"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentManagement;
