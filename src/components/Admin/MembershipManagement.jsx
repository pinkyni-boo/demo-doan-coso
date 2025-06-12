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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {membership.price?.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
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
    </div>
  );
}
