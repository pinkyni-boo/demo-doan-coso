import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function PaymentManagement() {
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPayment, setExpandedPayment] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("pending"); // Options: "pending", "rejected", "completed"
  const [payments, setPayments] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  // Add state for rejection dialog
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Add this state to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState(null);

  React.useEffect(() => {
    // We no longer need the hover CSS
    const style = document.createElement("style");
    style.innerHTML = `
      /* Custom styles but no hover behavior */
      .dropdown-content {
        display: none;
      }
      .dropdown-content.show {
        display: block;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Extract the fetchPayments function to reuse it
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      // Determine URL based on active tab
      const url =
        activeTab === "pending"
          ? "http://localhost:5000/api/payments/pending"
          : activeTab === "rejected"
          ? "http://localhost:5000/api/payments/rejected"
          : "http://localhost:5000/api/payments/completed";

      console.log(`Fetching ${activeTab} payments from frontend`);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to fetch ${activeTab} payments`
        );
      }

      const data = await response.json();
      console.log(`Received ${activeTab} payments:`, data);
      setPayments(data);
      setError(null);
    } catch (error) {
      console.error(`Error fetching ${activeTab} payments:`, error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

    // Fetch payments
    fetchPayments();
  }, [navigate, activeTab]); // activeTab dependency remains

  // Update the handleApprovePayment function
  const handleApprovePayment = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");

      // Find the payment in the current payments state instead of pendingPayments
      const payment = payments.find((p) => p._id === paymentId);
      if (!payment) {
        throw new Error("Không tìm thấy thông tin thanh toán");
      }

      console.log("Approving payment:", payment);
      console.log("Registration IDs:", payment.registrationIds);

      // Call the approve endpoint with the exact registration IDs from the payment
      const response = await fetch(
        `http://localhost:5000/api/payments/approve/${paymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            // Send only the exact registration IDs in this payment
            registrationIds: payment.registrationIds,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể xác nhận thanh toán");
      }

      // Update UI by removing the approved payment
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out";
      notification.textContent = "Đã xác nhận thanh toán thành công!";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 3000);
    } catch (error) {
      console.error("Error approving payment:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  // Replace the handleRejectPayment function with this:
  const handleRejectPayment = (paymentId) => {
    setRejectPaymentId(paymentId);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  // Update the submitRejectPayment function
  const submitRejectPayment = async () => {
    if (!rejectPaymentId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/payments/reject/${rejectPaymentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể từ chối thanh toán");
      }

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out";
      notification.textContent = "Đã từ chối thanh toán!";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 3000);

      setShowRejectDialog(false);

      // Reload data after rejection
      await fetchPayments();
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  // Fix the togglePaymentDetails function to work with all tabs

  const togglePaymentDetails = async (paymentId) => {
    if (expandedPayment === paymentId) {
      setExpandedPayment(null);
      return;
    }

    setExpandedPayment(paymentId);
    setLoadingDetails(true);

    try {
      const token = localStorage.getItem("token");
      // Use the current tab's payments
      const payment = payments.find((p) => p._id === paymentId);

      if (
        !payment ||
        !payment.registrationIds ||
        payment.registrationIds.length === 0
      ) {
        setPaymentDetails({ [paymentId]: { items: [] } });
        setLoadingDetails(false);
        return;
      }

      // Fetch payment details directly
      const detailsResponse = await axios.get(
        `http://localhost:5000/api/payments/${paymentId}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (detailsResponse.data && detailsResponse.data.items) {
        setPaymentDetails({
          ...paymentDetails,
          [paymentId]: detailsResponse.data,
        });
      } else {
        // Fallback to a simpler display with just IDs
        const items = payment.registrationIds.map((regId) => ({
          id: regId,
          type: payment.paymentType.includes("membership")
            ? "membership"
            : "class",
          name: payment.paymentType.includes("membership")
            ? "Gói thành viên"
            : `Lớp học (ID: ${regId.substring(regId.length - 6)})`,
          price: payment.amount / payment.registrationIds.length,
        }));

        setPaymentDetails({
          ...paymentDetails,
          [paymentId]: {
            items,
            totalItems: items.length,
            totalAmount: payment.amount,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);

      // Fallback to basic display with IDs when API call fails
      const payment = payments.find((p) => p._id === paymentId);
      if (payment) {
        const items = payment.registrationIds.map((regId) => ({
          id: regId,
          type: "unknown",
          name: `ID: ${regId.substring(regId.length - 6)}`,
          price: 0,
        }));

        setPaymentDetails({
          ...paymentDetails,
          [paymentId]: {
            items,
            totalItems: items.length,
            totalAmount: payment.amount,
            error: "Không thể tải chi tiết. Hiển thị ID đơn giản.",
          },
        });
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  // Add a function to handle payment deletion
  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/payments/${paymentToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa thanh toán");
      }

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out";
      notification.textContent = "Đã xóa thanh toán thành công!";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 3000);

      // Reload data after deletion
      await fetchPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setShowDeleteConfirm(false);
      setPaymentToDelete(null);
    }
  };

  // Add a confirmation dialog component for deletion
  const DeleteConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa</h3>
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn xóa thanh toán này? Hành động này không thể hoàn
          tác.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleDeletePayment}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );

  // Add the RejectDialog component
  const RejectDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Từ chối thanh toán
        </h3>

        <div className="mb-4">
          <label
            htmlFor="rejectionReason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Lý do từ chối
          </label>
          <textarea
            id="rejectionReason"
            rows="4"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Vui lòng nhập lý do từ chối thanh toán này..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowRejectDialog(false)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={submitRejectPayment}
            disabled={!rejectionReason.trim()}
            className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${
              !rejectionReason.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );

  // Add a function to handle status updates for completed payments
  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/payments/${paymentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái thanh toán");
      }

      // Show success notification
      const notification = document.createElement("div");
      notification.className =
        "fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out";
      notification.textContent = "Đã cập nhật trạng thái thanh toán!";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 3000);

      // Reload data from server
      await fetchPayments();
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert(`Lỗi: ${error.message}`);
    }
  };

  // Add an effect to close dropdown when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [openDropdownId]);

  // Add a click outside handler to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest(".dropdown")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdownId]);

  if (loading)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Đã xảy ra lỗi</h3>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Quản lý thanh toán
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Xem và xử lý các yêu cầu thanh toán đang chờ xác nhận
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "pending"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Chờ xác nhận
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "completed"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Đã xác nhận
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "rejected"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Đã từ chối
            </button>
          </nav>
        </div>

        {payments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-xl font-medium text-gray-500">
              Không có thanh toán nào đang chờ xác nhận
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại thanh toán
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phương thức
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === "completed"
                        ? "Ngày xác nhận"
                        : activeTab === "rejected"
                        ? "Lý do từ chối"
                        : "Ngày tạo"}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <React.Fragment key={payment._id}>
                      <tr
                        className={`hover:bg-gray-50 ${
                          expandedPayment === payment._id ? "bg-indigo-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.user?.username || "Không tìm thấy"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.user?.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.paymentType === "membership"
                                ? "bg-purple-100 text-purple-800"
                                : payment.paymentType === "membership_upgrade"
                                ? "bg-indigo-100 text-indigo-800"
                                : payment.paymentType === "membership_and_class"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {payment.paymentType === "membership"
                              ? "Gói thành viên"
                              : payment.paymentType === "membership_upgrade"
                              ? "Nâng cấp gói"
                              : payment.paymentType === "membership_and_class"
                              ? "Gói + Lớp học"
                              : "Lớp học"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {payment.amount?.toLocaleString()}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {payment.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activeTab === "completed" ? (
                            <div className="text-sm text-gray-900">
                              {payment.completedAt
                                ? new Date(payment.completedAt).toLocaleString()
                                : new Date(payment.updatedAt).toLocaleString()}
                              <div className="text-xs text-green-600 mt-1">
                                Xác nhận bởi: {payment.approvedBy || "Admin"}
                              </div>
                            </div>
                          ) : activeTab === "rejected" ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 mb-1">
                                Lý do từ chối:
                              </div>
                              <div className="text-red-600 bg-red-50 p-2 rounded border border-red-100 max-w-xs overflow-auto max-h-20">
                                {payment.rejectionReason || "Không có lý do"}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {new Date(payment.createdAt).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => togglePaymentDetails(payment._id)}
                            className="mr-4 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
                          >
                            {expandedPayment === payment._id
                              ? "Ẩn chi tiết"
                              : "Xem chi tiết"}
                          </button>

                          {activeTab === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprovePayment(payment._id)
                                }
                                className="mr-4 px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment._id)}
                                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                              >
                                Từ chối
                              </button>
                            </>
                          )}

                          {activeTab === "completed" && (
                            <div className="dropdown relative inline-block">
                              <button
                                onClick={() =>
                                  setOpenDropdownId(
                                    openDropdownId === payment._id
                                      ? null
                                      : payment._id
                                  )
                                }
                                className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors flex items-center"
                              >
                                <span>Cập nhật</span>
                                <svg
                                  className={`w-4 h-4 ml-1 transition-transform ${
                                    openDropdownId === payment._id
                                      ? "transform rotate-180"
                                      : ""
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                  ></path>
                                </svg>
                              </button>
                              <div
                                className={`dropdown-content absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-100 ${
                                  openDropdownId === payment._id ? "show" : ""
                                }`}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleUpdatePaymentStatus(
                                        payment._id,
                                        "pending"
                                      );
                                      setOpenDropdownId(null); // Close dropdown after action
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                  >
                                    Đánh dấu chờ xác nhận
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleUpdatePaymentStatus(
                                        payment._id,
                                        "cancelled"
                                      );
                                      setOpenDropdownId(null); // Close dropdown after action
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    Đánh dấu đã hủy
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === "rejected" && (
                            <button
                              onClick={() => {
                                setPaymentToDelete(payment._id);
                                setShowDeleteConfirm(true);
                              }}
                              className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                            >
                              Xóa
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expandable detail row */}
                      {expandedPayment === payment._id && (
                        <tr className="bg-indigo-50">
                          <td colSpan="6" className="px-6 py-4">
                            {loadingDetails ? (
                              <div className="flex items-center justify-center py-4">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-indigo-700">
                                  Đang tải chi tiết...
                                </span>
                              </div>
                            ) : (
                              <div className="text-sm">
                                <h4 className="font-medium text-gray-800 mb-3">
                                  Chi tiết thanh toán
                                </h4>

                                {paymentDetails[payment._id]?.items?.length >
                                0 ? (
                                  <div className="space-y-3">
                                    {paymentDetails[payment._id].error && (
                                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800 mb-3">
                                        {paymentDetails[payment._id].error}
                                      </div>
                                    )}

                                    {paymentDetails[payment._id].items.map(
                                      (item, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between"
                                        >
                                          <div>
                                            <span
                                              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mr-2 ${
                                                item.type === "membership"
                                                  ? "bg-purple-100 text-purple-800"
                                                  : item.type === "class"
                                                  ? "bg-blue-100 text-blue-800"
                                                  : item.type === "error"
                                                  ? "bg-red-100 text-red-800"
                                                  : "bg-gray-100 text-gray-800"
                                              }`}
                                            >
                                              {item.type === "membership"
                                                ? "Gói thành viên"
                                                : item.type === "class"
                                                ? "Lớp học"
                                                : item.type === "error"
                                                ? "Lỗi"
                                                : "Không xác định"}
                                            </span>
                                            <span className="font-medium">
                                              {item.name}
                                            </span>
                                            {item.scheduleInfo && (
                                              <span className="ml-2 text-gray-500">
                                                {item.scheduleInfo}
                                              </span>
                                            )}
                                            {item.duration && (
                                              <span className="ml-2 text-gray-500">
                                                {item.duration}
                                              </span>
                                            )}
                                          </div>
                                          <div className="font-semibold">
                                            {item.price > 0
                                              ? `${item.price.toLocaleString()}đ`
                                              : ""}
                                          </div>
                                        </div>
                                      )
                                    )}

                                    <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-medium">
                                      <span>Tổng cộng:</span>
                                      <span>
                                        {payment.amount.toLocaleString()}đ
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800">
                                    Không có thông tin chi tiết hoặc đã xảy ra
                                    lỗi khi tải dữ liệu
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showDeleteConfirm && <DeleteConfirmDialog />}
        {showRejectDialog && <RejectDialog />}
      </div>
    </div>
  );
}
