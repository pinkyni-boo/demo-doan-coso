import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  gender: "male",
  status: "active",
  specialty: "",
  experience: 0,
  internalNote: "",
  terminatedReason: "",
  isLocked: false,
  newPassword: "",
};

const genders = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
];

const statuses = [
  { value: "active", label: "Đang làm" },
  { value: "inactive", label: "Tạm nghỉ" },
  { value: "terminated", label: "Nghỉ việc" },
];

export default function TrainerManagement() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [services, setServices] = useState([]);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [isAdmin] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTrainers();
    fetchServices();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/trainers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Trainers data:", res.data); // Debug log
      setTrainers(res.data || []);
    } catch (error) {
      console.error("Error fetching trainers:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      setError("Lỗi khi tải danh sách trainer: " + errorMessage);
      setTrainers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/services", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setServices(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "status" && value === "terminated") {
      setForm((prev) => ({ ...prev, terminatedReason: "" }));
    }
  };

  const openModal = (type, trainer = null) => {
    setModalType(type);
    setShowModal(true);
    setSelectedTrainer(trainer);
    if (trainer) {
      setForm({
        ...defaultForm,
        ...trainer,
        specialty: trainer.specialty?._id || trainer.specialty || "",
        internalNote: trainer.internalNote || "",
        newPassword: "", // Reset password field khi edit
      });
      setAuditLogs(trainer.auditLogs || []);
    } else {
      setForm(defaultForm);
      setAuditLogs([]);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTrainer(null);
    setForm(defaultForm);
    setAuditLogs([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.specialty) {
      alert("Vui lòng chọn chuyên môn!");
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert("Vui lòng nhập email hợp lệ!");
      return;
    }

    // Validation số điện thoại (9-15 số)
    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(form.phone)) {
      alert("Vui lòng nhập số điện thoại hợp lệ (9-15 chữ số)!");
      return;
    }

    const token = localStorage.getItem("token");
    const payload = { ...form };
    if (form.status === "terminated") {
      payload.isLocked = true;
      payload.terminatedReason = form.terminatedReason;
    }

    setIsSubmitting(true);
    try {
      if (modalType === "edit" && selectedTrainer) {
        const response = await axios.put(
          `http://localhost:5000/api/trainers/${selectedTrainer._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.message) {
          alert(response.data.message);
        } else if (response.data.warning) {
          alert(response.data.warning);
        } else {
          alert("Cập nhật HLV thành công!");
        }
      } else {
        const response = await axios.post(
          "http://localhost:5000/api/trainers",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Hiển thị thông báo tài khoản đăng nhập nếu có
        if (response.data.message) {
          alert(response.data.message);
        } else if (response.data.warning) {
          alert(response.data.warning);
        }
      }
      closeModal();
      fetchTrainers();
    } catch (err) {
      // Kiểm tra lỗi 400 (Bad Request) - email/phone trùng lặp
      if (err.response?.status === 400) {
        alert(err.response.data.error);
      } else {
        alert(err.response?.data?.error || "Lỗi khi tạo/cập nhật HLV");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (trainer, newStatus) => {
    setEditing(trainer);
    setForm({
      ...form,
      status: newStatus,
    });
    setShowStatusPopup(true);
  };

  const confirmStatusChange = async () => {
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:5000/api/trainers/${editing._id}/status`,
      { status: form.status, reason: statusReason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setShowStatusPopup(false);
    setEditing(null);
    setStatusReason("");
    fetchTrainers();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Quản lý Huấn luyện viên</h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Lỗi kết nối
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                  {error.includes("Network Error") && (
                    <div className="mt-2 p-2 bg-red-100 rounded">
                      <p className="font-medium">
                        Có thể backend server chưa chạy:
                      </p>
                      <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>Mở terminal trong thư mục backend</li>
                        <li>
                          Chạy lệnh:{" "}
                          <code className="bg-red-200 px-1 rounded">
                            npm start
                          </code>
                        </li>
                        <li>Đảm bảo server chạy trên port 5000</li>
                      </ol>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setError("");
                      fetchTrainers();
                    }}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => openModal("add")}
          className="bg-amber-500 text-white px-4 py-2 rounded mb-4"
        >
          Thêm Huấn luyện viên
        </button>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                <span className="text-gray-600">
                  Đang tải danh sách trainer...
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Danh sách HLV */}
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Họ tên</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">SĐT</th>
                  <th className="border px-4 py-2">Giới tính</th>
                  <th className="border px-4 py-2">Trạng thái</th>
                  <th className="border px-4 py-2">Chuyên môn</th>
                  <th className="border px-4 py-2">Kinh nghiệm</th>
                  <th className="border px-4 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer, idx) =>
                  trainer && trainer.fullName ? (
                    <tr key={trainer._id || idx} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{trainer.fullName}</td>
                      <td className="border px-4 py-2">{trainer.email}</td>
                      <td className="border px-4 py-2">{trainer.phone}</td>
                      <td className="border px-4 py-2">
                        {trainer.gender === "male" ? "Nam" : "Nữ"}
                      </td>
                      <td className="border px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trainer.status === "active"
                              ? "bg-green-100 text-green-800"
                              : trainer.status === "inactive"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {statuses.find((s) => s.value === trainer.status)
                            ?.label || trainer.status}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        {trainer.specialty?.name ||
                          trainer.specialty?.serviceName ||
                          "Chưa có"}
                      </td>
                      <td className="border px-4 py-2">
                        {trainer.experience} năm
                      </td>
                      <td className="border px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal("edit", trainer)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => openModal("view", trainer)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Xem
                          </button>
                          {trainer.status !== "terminated" && (
                            <button
                              onClick={() =>
                                handleStatusChange(trainer, "terminated")
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Nghỉ việc
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={idx}>
                      <td
                        colSpan="8"
                        className="border px-4 py-2 text-center text-gray-500"
                      >
                        Dữ liệu trainer không hợp lệ
                      </td>
                    </tr>
                  )
                )}
                {trainers.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="8"
                      className="border px-4 py-2 text-center text-gray-500 py-8"
                    >
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Chưa có trainer nào
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Bắt đầu bằng cách thêm trainer đầu tiên.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={() => openModal("add")}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                          >
                            Thêm Trainer Đầu Tiên
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
        {/* Popup chuyển trạng thái */}
        {showStatusPopup && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
              <h3 className="font-bold text-lg mb-2">
                Xác nhận chuyển trạng thái
              </h3>
              <p className="mb-2">Nhập lý do chuyển trạng thái:</p>
              <textarea
                className="border w-full p-2 rounded mb-2"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="bg-gray-200 px-4 py-2 rounded"
                  onClick={() => setShowStatusPopup(false)}
                >
                  Hủy
                </button>
                <button
                  className="bg-amber-500 text-white px-4 py-2 rounded"
                  onClick={confirmStatusChange}
                  disabled={!statusReason}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal thêm/sửa HLV */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {modalType === "add"
                    ? "Thêm HLV mới"
                    : modalType === "edit"
                    ? "Chỉnh sửa HLV"
                    : "Chi tiết HLV"}
                </h3>
                <button onClick={closeModal}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ tên
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>
                  {modalType === "edit" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu mới (để trống nếu không đổi)
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu mới..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      {genders.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chuyên môn
                    </label>
                    <select
                      name="specialty"
                      value={form.specialty}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      required
                    >
                      <option value="">-- Chọn chuyên môn --</option>
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kinh nghiệm (năm)
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      min={0}
                      required
                    />
                  </div>
                </div>
                {/* Thông tin tài khoản bị khóa */}
                {selectedTrainer?.userId?.isAccountLocked && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-red-600 font-semibold">
                        🔒 Tài khoản đã bị khóa
                      </span>
                    </div>
                    <p className="text-red-700 text-sm">
                      <strong>Lý do:</strong>{" "}
                      {selectedTrainer.userId.lockReason ||
                        "Không có lý do cụ thể"}
                    </p>
                  </div>
                )}
                {/* Thông tin nội bộ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú nội bộ (chỉ admin)
                  </label>
                  <input
                    type="text"
                    name="internalNote"
                    value={form.internalNote}
                    onChange={handleChange}
                    disabled={modalType === "view"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
                {/* Lý do nghỉ việc */}
                {form.status === "terminated" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lý do nghỉ việc <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="terminatedReason"
                      value={form.terminatedReason}
                      onChange={handleChange}
                      disabled={modalType === "view"}
                      required={form.status === "terminated"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
                      rows={3}
                      placeholder="Nhập lý do nghỉ việc"
                    />
                  </div>
                )}
                {/* Nhật ký thay đổi */}
                {editing && auditLogs.length > 0 && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold mb-2">Nhật ký thay đổi</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1">Thao tác</th>
                          <th className="border px-2 py-1">Người thực hiện</th>
                          <th className="border px-2 py-1">Thời gian</th>
                          <th className="border px-2 py-1">Lý do</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log, idx) => (
                          <tr key={idx}>
                            <td className="border px-2 py-1">{log.action}</td>
                            <td className="border px-2 py-1">
                              {log.by?.fullName || log.by || "?"}
                            </td>
                            <td className="border px-2 py-1">
                              {new Date(log.at).toLocaleString()}
                            </td>
                            <td className="border px-2 py-1">{log.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded border"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Đang xử lý..."
                      : modalType === "edit"
                      ? "Cập nhật"
                      : "Thêm mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
