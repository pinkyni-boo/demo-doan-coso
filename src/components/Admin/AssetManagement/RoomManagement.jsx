import React, { useState, useEffect } from "react";
import axios from "../../../config/axios";
import { toast } from "react-toastify";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Square,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Settings,
} from "lucide-react";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // 'create', 'edit', 'view'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const [formData, setFormData] = useState({
    roomName: "",
    roomCode: "",
    location: "",
    capacity: "",
    area: "",
    status: "active",
    facilities: "",
    description: "",
  });

  const [stats, setStats] = useState({
    totalRooms: 0,
    activeRooms: 0,
    maintenanceRooms: 0,
    inactiveRooms: 0,
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      roomName: "",
      roomCode: "",
      location: "",
      capacity: "",
      area: "",
      status: "active",
      facilities: "",
      description: "",
    });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, statusFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const roomsData = response.data.data;
      setRooms(roomsData);

      // Calculate stats
      const stats = {
        totalRooms: roomsData.length,
        activeRooms: roomsData.filter((room) => room.status === "active")
          .length,
        maintenanceRooms: roomsData.filter(
          (room) => room.status === "maintenance"
        ).length,
        inactiveRooms: roomsData.filter((room) => room.status === "inactive")
          .length,
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Lỗi khi tải danh sách phòng tập");
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((room) => room.status === statusFilter);
    }

    setFilteredRooms(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const facilitiesArray = formData.facilities
        ? formData.facilities
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f)
        : [];

      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : 0,
        area: formData.area ? parseFloat(formData.area) : 0,
        facilities: facilitiesArray,
      };

      if (modalType === "create") {
        await axios.post("/api/rooms", submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Đã tạo phòng tập thành công!");
      } else if (modalType === "edit") {
        await axios.put(`/api/rooms/${selectedRoom._id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Đã cập nhật phòng tập thành công!");
      }

      setShowModal(false);
      resetForm();
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomName: room.roomName,
      roomCode: room.roomCode,
      location: room.location,
      capacity: room.capacity.toString(),
      area: room.area.toString(),
      status: room.status,
      facilities: room.facilities ? room.facilities.join(", ") : "",
      description: room.description || "",
    });
    setModalType("edit");
    setShowModal(true);
  };

  const handleView = (room) => {
    setSelectedRoom(room);
    setModalType("view");
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/rooms/${roomToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Đã xóa phòng tập thành công!");
      setShowDeleteConfirm(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa phòng tập");
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: "bg-green-100 text-green-800 border-green-200",
      maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
      inactive: "bg-red-100 text-red-800 border-red-200",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "maintenance":
        return <Settings className="w-4 h-4" />;
      case "inactive":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      active: "Hoạt động",
      maintenance: "Bảo trì",
      inactive: "Ngừng hoạt động",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản lý phòng tập
        </h1>
        <p className="text-gray-600">
          Quản lý thông tin các phòng tập trong hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số phòng</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalRooms}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Đang hoạt động
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.activeRooms}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang bảo trì</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.maintenanceRooms}
              </p>
            </div>
            <Settings className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Ngừng hoạt động
              </p>
              <p className="text-3xl font-bold text-red-600">
                {stats.inactiveRooms}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="maintenance">Bảo trì</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>

            <button
              onClick={() => {
                setModalType("create");
                setSelectedRoom(null);
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm phòng tập
            </button>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-amber-50">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng tập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sức chứa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diện tích
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiện nghi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">
                        Không tìm thấy phòng tập nào
                      </p>
                      <p className="text-sm">
                        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {room.roomName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mã: {room.roomCode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {room.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        {room.capacity} người
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Square className="w-4 h-4 mr-1" />
                        {room.area}m²
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          room.status
                        )}`}
                      >
                        {getStatusIcon(room.status)}
                        {getStatusText(room.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {room.facilities && room.facilities.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {room.facilities
                              .slice(0, 2)
                              .map((facility, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                                >
                                  {facility}
                                </span>
                              ))}
                            {room.facilities.length > 2 && (
                              <span className="text-gray-500 text-xs">
                                +{room.facilities.length - 2} khác
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa có</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(room)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(room)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRoomToDelete(room);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {modalType === "create" && "Thêm phòng tập mới"}
                {modalType === "edit" && "Chỉnh sửa phòng tập"}
                {modalType === "view" && "Chi tiết phòng tập"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                  setSelectedRoom(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {modalType === "view" ? (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên phòng tập
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedRoom?.roomName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã phòng
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedRoom?.roomCode}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vị trí
                    </label>
                    <p className="text-gray-900">{selectedRoom?.location}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        selectedRoom?.status
                      )}`}
                    >
                      {getStatusIcon(selectedRoom?.status)}
                      {getStatusText(selectedRoom?.status)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sức chứa
                    </label>
                    <p className="text-gray-900">
                      {selectedRoom?.capacity} người
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diện tích
                    </label>
                    <p className="text-gray-900">{selectedRoom?.area}m²</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiện nghi
                  </label>
                  {selectedRoom?.facilities &&
                  selectedRoom.facilities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Chưa có tiện nghi nào
                    </p>
                  )}
                </div>

                {selectedRoom?.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <p className="text-gray-900">{selectedRoom.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày tạo
                    </label>
                    <p className="text-gray-600">
                      {new Date(selectedRoom?.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cập nhật cuối
                    </label>
                    <p className="text-gray-600">
                      {new Date(selectedRoom?.updatedAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Create/Edit Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên phòng tập *
                    </label>
                    <input
                      type="text"
                      value={formData.roomName}
                      onChange={(e) =>
                        setFormData({ ...formData, roomName: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Phòng Cardio 1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã phòng *
                    </label>
                    <input
                      type="text"
                      value={formData.roomCode}
                      onChange={(e) =>
                        setFormData({ ...formData, roomCode: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: CARD-01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vị trí *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: Tầng 2, Khu A"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="inactive">Ngừng hoạt động</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sức chứa (người) *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: 30"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diện tích (m²) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="VD: 50.5"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiện nghi
                  </label>
                  <input
                    type="text"
                    value={formData.facilities}
                    onChange={(e) =>
                      setFormData({ ...formData, facilities: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Điều hòa, Gương, Âm thanh, Wifi (cách nhau bằng dấu phẩy)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập các tiện nghi cách nhau bằng dấu phẩy
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về phòng tập..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        {modalType === "create"
                          ? "Tạo phòng tập"
                          : "Cập nhật phòng tập"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                      setSelectedRoom(null);
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Xác nhận xóa phòng tập
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn xóa phòng tập "{roomToDelete?.roomName}"?
                Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Xóa
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRoomToDelete(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
