import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function MembershipManagement() {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const [filteredMemberships, setFilteredMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, expired, cancelled
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);

  // Renewal states
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [membershipToRenew, setMembershipToRenew] = useState(null);
  const [renewalPackage, setRenewalPackage] = useState("");
  const [renewalPaymentStatus, setRenewalPaymentStatus] = useState(true);

  useEffect(() => {
    // Kiểm tra xác thực và quyền admin
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "admin") {
        navigate("/");
        return;
      }
    } catch (error) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    // Lấy danh sách tất cả thẻ thành viên
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/memberships",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Highlight memberships that are pending payment
        const enhancedMemberships = response.data.map((membership) => ({
          ...membership,
          isPendingPayment: !membership.paymentStatus,
        }));

        setMemberships(enhancedMemberships);
        setFilteredMemberships(enhancedMemberships); // Initialize with all memberships
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách thẻ thành viên"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [navigate]);

  // Apply filter when filter state or memberships change
  useEffect(() => {
    if (filter === "all") {
      setFilteredMemberships(memberships);
    } else {
      setFilteredMemberships(
        memberships.filter((membership) => membership.status === filter)
      );
    }
  }, [filter, memberships]);

  // Cập nhật trạng thái thẻ thành viên
  const handleUpdateStatus = async (membershipId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/memberships/${membershipId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật UI
      setMemberships(
        memberships.map((membership) =>
          membership._id === membershipId
            ? { ...membership, status: newStatus }
            : membership
        )
      );
    } catch (error) {
      console.error("Error updating membership status:", error);
      alert("Không thể cập nhật trạng thái thẻ thành viên");
    }
  };

  // Confirm delete membership
  const confirmDelete = (membershipId) => {
    setMembershipToDelete(membershipId);
    setShowDeleteConfirm(true);
  };

  // Permanently delete membership from database
  const handleDeleteMembership = async () => {
    if (!membershipToDelete) return;

    try {
      const token = localStorage.getItem("token");
      // Use the permanent delete endpoint
      await axios.delete(
        `http://localhost:5000/api/memberships/permanent/${membershipToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove from state
      setMemberships(
        memberships.filter(
          (membership) => membership._id !== membershipToDelete
        )
      );
      setShowDeleteConfirm(false);
      setMembershipToDelete(null);
    } catch (error) {
      console.error("Error deleting membership:", error);
      alert("Không thể xóa thẻ thành viên");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Format price
  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") + "đ";
  };

  // Membership packages
  const membershipPackages = {
    "basic-monthly": { name: "Basic - Tháng", price: 500000, duration: 30 },
    "standard-monthly": {
      name: "Standard - Tháng",
      price: 800000,
      duration: 30,
    },
    "vip-monthly": { name: "VIP - Tháng", price: 1200000, duration: 30 },
    "basic-quarterly": { name: "Basic - Quý", price: 1400000, duration: 90 },
    "standard-quarterly": {
      name: "Standard - Quý",
      price: 2200000,
      duration: 90,
    },
    "vip-quarterly": { name: "VIP - Quý", price: 3300000, duration: 90 },
    "basic-annual": { name: "Basic - Năm", price: 5000000, duration: 365 },
    "standard-annual": {
      name: "Standard - Năm",
      price: 8000000,
      duration: 365,
    },
    "vip-annual": { name: "VIP - Năm", price: 12000000, duration: 365 },
  };

  // Check if membership is expiring soon (within 7 days)
  const isExpiringSoon = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  // Check if membership is expired
  const isExpired = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    return end < today;
  };

  // Calculate new dates for renewal
  const calculateRenewalDates = (oldEndDate, packageType) => {
    const oldEnd = new Date(oldEndDate);
    const today = new Date();

    // If already expired, start from today, otherwise start from day after old end date
    const newStart =
      oldEnd < today ? today : new Date(oldEnd.getTime() + 24 * 60 * 60 * 1000);

    const packageInfo = membershipPackages[packageType];
    const duration = packageInfo ? packageInfo.duration : 30;

    const newEnd = new Date(
      newStart.getTime() + duration * 24 * 60 * 60 * 1000
    );

    return { newStart, newEnd };
  };

  // Open renewal modal
  const openRenewModal = (membership) => {
    setMembershipToRenew(membership);
    setRenewalPackage(membership.type || "standard-monthly");
    setRenewalPaymentStatus(true);
    setShowRenewModal(true);
  };

  // Handle renewal
  const handleRenewMembership = async () => {
    if (!membershipToRenew || !renewalPackage) {
      alert("Vui lòng chọn gói gia hạn");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const packageInfo = membershipPackages[renewalPackage];

      const response = await axios.post(
        `http://localhost:5000/api/memberships/renew/${membershipToRenew._id}`,
        {
          type: renewalPackage,
          price: packageInfo.price,
          paymentStatus: renewalPaymentStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update UI with new membership data
      setMemberships(
        memberships.map((m) =>
          m._id === membershipToRenew._id
            ? { ...m, ...response.data.membership }
            : m
        )
      );

      // Close modal
      setShowRenewModal(false);
      setMembershipToRenew(null);
      setRenewalPackage("");

      alert("Gia hạn thẻ thành công!");
    } catch (error) {
      console.error("Error renewing membership:", error);
      alert(
        error.response?.data?.message || "Không thể gia hạn thẻ thành viên"
      );
    }
  };

  if (loading) return <div className="p-6 pt-24 text-center">Đang tải...</div>;
  if (error)
    return <div className="p-6 pt-24 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 pt-24">
      <h1 className="text-2xl font-bold mb-6">Quản lý thẻ thành viên</h1>

      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg ${
            filter === "all"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg ${
            filter === "active"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Đang hoạt động
        </button>
        <button
          onClick={() => setFilter("expired")}
          className={`px-4 py-2 rounded-lg ${
            filter === "expired"
              ? "bg-amber-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Đã hết hạn
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 rounded-lg ${
            filter === "cancelled"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Đã hủy
        </button>
        <button
          onClick={() => setFilter("pending_payment")}
          className={`px-4 py-2 rounded-lg ${
            filter === "pending_payment"
              ? "bg-yellow-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Chờ thanh toán
        </button>
      </div>

      {filteredMemberships.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-center">
            {filter === "all"
              ? "Không có thẻ thành viên nào"
              : `Không có thẻ thành viên nào ở trạng thái "${
                  filter === "active"
                    ? "đang hoạt động"
                    : filter === "expired"
                    ? "đã hết hạn"
                    : filter === "cancelled"
                    ? "đã hủy"
                    : "chờ thanh toán"
                }"`}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại thẻ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày bắt đầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày hết hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái thanh toán
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMemberships.map((membership) => (
                  <tr key={membership._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {membership.user?.username || "Không tìm thấy"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {membership.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          membership.type === "VIP"
                            ? "bg-purple-100 text-purple-800"
                            : membership.type === "Standard"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {membership.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(membership.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(membership.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            membership.status === "active"
                              ? "bg-green-100 text-green-800"
                              : membership.status === "expired"
                              ? "bg-yellow-100 text-yellow-800"
                              : membership.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {membership.status === "active"
                            ? "Hoạt động"
                            : membership.status === "expired"
                            ? "Hết hạn"
                            : membership.status === "cancelled"
                            ? "Đã hủy"
                            : "Chờ thanh toán"}
                        </span>
                        {/* Warning badge for expiring soon */}
                        {membership.status === "active" &&
                          isExpiringSoon(membership.endDate) && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              ⚠️ Sắp hết hạn
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {membership.price?.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {/* Hiển thị nút Gia hạn cho các thẻ không bị hủy */}
                        {membership.status !== "cancelled" && (
                          <button
                            onClick={() => openRenewModal(membership)}
                            className={`${
                              isExpiringSoon(membership.endDate) ||
                              isExpired(membership.endDate)
                                ? "text-blue-600 hover:text-blue-900 font-semibold"
                                : "text-blue-600 hover:text-blue-900"
                            }`}
                          >
                            {isExpiringSoon(membership.endDate)
                              ? "⚠️ Gia hạn thẻ"
                              : isExpired(membership.endDate)
                              ? "🔴 Gia hạn thẻ"
                              : "Gia hạn thẻ"}
                          </button>
                        )}

                        {membership.status === "active" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(membership._id, "expired")
                              }
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Đánh dấu hết hạn
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(membership._id, "cancelled")
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Hủy thẻ
                            </button>
                          </>
                        )}
                        {membership.status === "expired" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(membership._id, "active")
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Kích hoạt lại
                          </button>
                        )}
                        {membership.status === "cancelled" && (
                          <button
                            onClick={() => confirmDelete(membership._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa dữ liệu
                          </button>
                        )}
                        {membership.status === "pending_payment" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(membership._id, "active")
                              }
                              className="text-green-600 hover:text-green-900"
                            >
                              Xác nhận thanh toán
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(membership._id, "cancelled")
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Hủy đăng ký
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          membership.paymentStatus
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {membership.paymentStatus
                          ? "Đã thanh toán"
                          : "Chờ thanh toán"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Xác nhận xóa dữ liệu</h3>
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa thẻ thành viên này? Hành động này sẽ xóa
              hoàn toàn dữ liệu khỏi hệ thống và không thể khôi phục.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteMembership}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
      {showRenewModal && membershipToRenew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-indigo-600">
              Gia hạn thẻ thành viên
            </h3>

            {/* Current Membership Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">
                Thông tin thẻ hiện tại
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Thành viên</p>
                  <p className="font-medium">
                    {membershipToRenew.user?.username || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Loại thẻ hiện tại</p>
                  <p className="font-medium">{membershipToRenew.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                  <p className="font-medium">
                    {formatDate(membershipToRenew.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày hết hạn cũ</p>
                  <p className="font-medium text-red-600">
                    {formatDate(membershipToRenew.endDate)}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="mt-3 flex gap-2">
                {isExpired(membershipToRenew.endDate) && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                    Đã hết hạn
                  </span>
                )}
                {isExpiringSoon(membershipToRenew.endDate) &&
                  !isExpired(membershipToRenew.endDate) && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      Sắp hết hạn
                    </span>
                  )}
              </div>
            </div>

            {/* Select Renewal Package */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn gói gia hạn mới
              </label>
              <select
                value={renewalPackage}
                onChange={(e) => setRenewalPackage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {Object.entries(membershipPackages).map(([key, pkg]) => (
                  <option key={key} value={key}>
                    {pkg.name} - {formatPrice(pkg.price)} ({pkg.duration} ngày)
                  </option>
                ))}
              </select>
            </div>

            {/* Preview New Dates */}
            {renewalPackage && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">
                  Thông tin gia hạn mới
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Ngày bắt đầu mới</p>
                    <p className="font-medium text-blue-900">
                      {formatDate(
                        calculateRenewalDates(
                          membershipToRenew.endDate,
                          renewalPackage
                        ).newStart
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Ngày hết hạn mới</p>
                    <p className="font-medium text-blue-900">
                      {formatDate(
                        calculateRenewalDates(
                          membershipToRenew.endDate,
                          renewalPackage
                        ).newEnd
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Giá gói mới</p>
                    <p className="font-bold text-blue-900 text-lg">
                      {formatPrice(membershipPackages[renewalPackage].price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Thời hạn</p>
                    <p className="font-medium text-blue-900">
                      {membershipPackages[renewalPackage].duration} ngày
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Preview:</span> Gia hạn từ{" "}
                    <span className="font-semibold">
                      {formatDate(membershipToRenew.endDate)}
                    </span>{" "}
                    sang{" "}
                    <span className="font-semibold">
                      {formatDate(
                        calculateRenewalDates(
                          membershipToRenew.endDate,
                          renewalPackage
                        ).newEnd
                      )}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="mb-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={renewalPaymentStatus}
                  onChange={(e) => setRenewalPaymentStatus(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Đã thanh toán (kích hoạt ngay)
                </span>
              </label>
              {!renewalPaymentStatus && (
                <p className="text-xs text-gray-500 mt-2 ml-8">
                  Nếu chưa thanh toán, thẻ sẽ ở trạng thái "Chờ thanh toán"
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowRenewModal(false);
                  setMembershipToRenew(null);
                  setRenewalPackage("");
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleRenewMembership}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Xác nhận gia hạn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
