import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MapPin,
  Wrench,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Activity,
} from "lucide-react";

const RoomEquipmentManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("rooms");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("room"); // 'room' or 'equipment'
  const [selectedItem, setSelectedItem] = useState(null);

  const [roomForm, setRoomForm] = useState({
    roomName: "",
    roomCode: "",
    location: "",
    capacity: "",
    area: "",
    facilities: [],
    description: "",
  });

  const [equipmentForm, setEquipmentForm] = useState({
    equipmentName: "",
    equipmentCode: "",
    category: "cardio",
    brand: "",
    model: "",
    purchaseDate: "",
    purchasePrice: "",
    room: "",
    supplier: {
      name: "",
      contact: "",
      email: "",
    },
  });

  useEffect(() => {
    fetchRooms();
    fetchEquipment();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/equipment", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipment(response.data.data.equipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/rooms", roomForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Đã tạo phòng tập thành công!");
      setShowModal(false);
      setRoomForm({
        roomName: "",
        roomCode: "",
        location: "",
        capacity: "",
        area: "",
        facilities: [],
        description: "",
      });
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo phòng tập");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/equipment", equipmentForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Đã tạo thiết bị thành công!");
      setShowModal(false);
      setEquipmentForm({
        equipmentName: "",
        equipmentCode: "",
        category: "cardio",
        brand: "",
        model: "",
        purchaseDate: "",
        purchasePrice: "",
        room: "",
        supplier: {
          name: "",
          contact: "",
          email: "",
        },
      });
      fetchEquipment();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo thiết bị");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800",
      available: "bg-green-100 text-green-800",
      "in-use": "bg-blue-100 text-blue-800",
      retired: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getConditionColor = (condition) => {
    const colorMap = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-orange-100 text-orange-800",
      broken: "bg-red-100 text-red-800",
    };
    return colorMap[condition] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý phòng tập & thiết bị
        </h1>
        <p className="text-gray-600">Quản lý cơ sở vật chất của phòng gym</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => {
            setModalType("room");
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm phòng tập
        </button>
        <button
          onClick={() => {
            setModalType("equipment");
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm thiết bị
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("rooms")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "rooms"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Phòng tập
            </button>
            <button
              onClick={() => setActiveTab("equipment")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "equipment"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Thiết bị
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "rooms" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                Danh sách phòng tập
              </h2>

              {rooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có phòng tập nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {room.roomName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Mã: {room.roomCode}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            room.status
                          )}`}
                        >
                          {room.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {room.location}
                        </div>
                        <div>Sức chứa: {room.capacity} người</div>
                        <div>Diện tích: {room.area}m²</div>
                        {room.facilities && room.facilities.length > 0 && (
                          <div>
                            <strong>Tiện nghi:</strong>{" "}
                            {room.facilities.join(", ")}
                          </div>
                        )}
                      </div>

                      {room.description && (
                        <p className="text-sm text-gray-700 mt-3">
                          {room.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="text-xs text-gray-500">
                          {room.lastInspectedAt && (
                            <>
                              Kiểm tra cuối:{" "}
                              {new Date(
                                room.lastInspectedAt
                              ).toLocaleDateString("vi-VN")}
                            </>
                          )}
                        </span>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "equipment" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Danh sách thiết bị</h2>

              {equipment.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Chưa có thiết bị nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {equipment.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {item.equipmentName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Mã: {item.equipmentCode}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(
                              item.condition
                            )}`}
                          >
                            {item.condition}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div>Loại: {item.category}</div>
                        {item.brand && <div>Hãng: {item.brand}</div>}
                        {item.room && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {item.room.roomName}
                          </div>
                        )}
                        <div>
                          Mua:{" "}
                          {new Date(item.purchaseDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                        <div>
                          Giá: {item.purchasePrice?.toLocaleString("vi-VN")}đ
                        </div>
                      </div>

                      {item.currentIssues && item.currentIssues.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Vấn đề hiện tại:</strong>{" "}
                            {item.currentIssues.join(", ")}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <span className="text-xs text-gray-500">
                          {item.lastReportedAt && (
                            <>
                              Báo cáo cuối:{" "}
                              {new Date(item.lastReportedAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </>
                          )}
                        </span>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-orange-600 hover:text-orange-800">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Adding Room/Equipment */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {modalType === "room"
                ? "Thêm phòng tập mới"
                : "Thêm thiết bị mới"}
            </h2>

            {modalType === "room" ? (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên phòng tập
                  </label>
                  <input
                    type="text"
                    value={roomForm.roomName}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, roomName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã phòng
                  </label>
                  <input
                    type="text"
                    value={roomForm.roomCode}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, roomCode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vị trí
                  </label>
                  <input
                    type="text"
                    value={roomForm.location}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, location: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sức chứa
                    </label>
                    <input
                      type="number"
                      value={roomForm.capacity}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, capacity: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diện tích (m²)
                    </label>
                    <input
                      type="number"
                      value={roomForm.area}
                      onChange={(e) =>
                        setRoomForm({ ...roomForm, area: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={roomForm.description}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors"
                  >
                    {loading ? "Đang tạo..." : "Tạo phòng tập"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateEquipment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên thiết bị
                  </label>
                  <input
                    type="text"
                    value={equipmentForm.equipmentName}
                    onChange={(e) =>
                      setEquipmentForm({
                        ...equipmentForm,
                        equipmentName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã thiết bị
                  </label>
                  <input
                    type="text"
                    value={equipmentForm.equipmentCode}
                    onChange={(e) =>
                      setEquipmentForm({
                        ...equipmentForm,
                        equipmentCode: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại thiết bị
                  </label>
                  <select
                    value={equipmentForm.category}
                    onChange={(e) =>
                      setEquipmentForm({
                        ...equipmentForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Tập sức mạnh</option>
                    <option value="free_weights">Tạ tự do</option>
                    <option value="functional">Functional</option>
                    <option value="audio_visual">Âm thanh - Hình ảnh</option>
                    <option value="accessories">Phụ kiện</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng tập
                  </label>
                  <select
                    value={equipmentForm.room}
                    onChange={(e) =>
                      setEquipmentForm({
                        ...equipmentForm,
                        room: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hãng
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.brand}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          brand: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.model}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          model: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày mua
                    </label>
                    <input
                      type="date"
                      value={equipmentForm.purchaseDate}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          purchaseDate: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá mua (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={equipmentForm.purchasePrice}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          purchasePrice: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition-colors"
                  >
                    {loading ? "Đang tạo..." : "Tạo thiết bị"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomEquipmentManagement;
