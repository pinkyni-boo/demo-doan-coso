import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Eye,
  Check,
  X,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    rating: "all",
    search: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      console.log("Fetching feedbacks with filters:", filters);

      const response = await axios.get(
        "http://localhost:5000/api/feedback/admin/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: filters.status !== "all" ? filters.status : undefined,
            type: filters.type !== "all" ? filters.type : undefined,
            rating: filters.rating !== "all" ? filters.rating : undefined,
            search: filters.search || undefined,
          },
        }
      );

      console.log("Feedbacks response:", response.data);

      if (response.data.success) {
        setFeedbacks(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn");
        localStorage.removeItem("token");
      } else if (error.response?.status === 404) {
        // API endpoint not found, set empty array
        setFeedbacks([]);
      } else {
        toast.error("Không thể tải danh sách đánh giá");
        setFeedbacks([]); // Set empty array to prevent infinite reload
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Reload when filters change
  useEffect(() => {
    // Skip if this is the initial render or if already loading
    if (loading) return;

    fetchFeedbacks();
  }, [filters.status, filters.type, filters.rating, filters.search]);

  const handleApproveFeedback = async (feedbackId) => {
    try {
      setActionLoading(feedbackId);
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/feedback/admin/${feedbackId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFeedbacks(
          feedbacks.map((fb) =>
            fb._id === feedbackId ? { ...fb, status: "approved" } : fb
          )
        );
        toast.success("Đã duyệt đánh giá thành công");

        // Đóng modal sau khi approve thành công
        setShowDetailModal(false);
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error("Error approving feedback:", error);
      toast.error("Không thể duyệt đánh giá");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectFeedback = async (feedbackId, reason) => {
    try {
      setActionLoading(feedbackId);
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `http://localhost:5000/api/feedback/admin/${feedbackId}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFeedbacks(
          feedbacks.map((fb) =>
            fb._id === feedbackId
              ? { ...fb, status: "rejected", rejectionReason: reason }
              : fb
          )
        );
        toast.success("Đã từ chối đánh giá");

        // Đóng modal sau khi reject thành công
        setShowDetailModal(false);
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error("Error rejecting feedback:", error);
      toast.error("Không thể từ chối đánh giá");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRespondToFeedback = async (feedbackId, response) => {
    try {
      setActionLoading(feedbackId);
      const token = localStorage.getItem("token");

      const apiResponse = await axios.post(
        `http://localhost:5000/api/feedback/admin/${feedbackId}/respond`,
        { response },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (apiResponse.data.success) {
        setFeedbacks(
          feedbacks.map((fb) =>
            fb._id === feedbackId
              ? {
                  ...fb,
                  adminResponse: {
                    content: response,
                    respondedAt: new Date().toISOString(),
                    respondedBy: "Admin",
                  },
                }
              : fb
          )
        );
        toast.success("Đã gửi phản hồi thành công");
      }
    } catch (error) {
      console.error("Error responding to feedback:", error);
      toast.error("Không thể gửi phản hồi");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      // Confirm before deleting
      const isConfirmed = window.confirm(
        "Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
      );

      if (!isConfirmed) return;

      setActionLoading(feedbackId);
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:5000/api/feedback/admin/${feedbackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Remove feedback from local state
        setFeedbacks(feedbacks.filter((fb) => fb._id !== feedbackId));
        toast.success("Đã xóa đánh giá thành công");

        // Close modal if this feedback is being viewed
        if (selectedFeedback?._id === feedbackId) {
          setShowDetailModal(false);
          setSelectedFeedback(null);
        }
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
      if (error.response?.status === 403) {
        toast.error("Chỉ có thể xóa đánh giá đã được duyệt");
      } else {
        toast.error("Không thể xóa đánh giá");
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800",
        label: "Chờ duyệt",
      },
      approved: {
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
        label: "Đã duyệt",
      },
      rejected: {
        icon: Ban,
        color: "bg-red-100 text-red-800",
        label: "Từ chối",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-500 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    if (filters.status !== "all" && feedback.status !== filters.status)
      return false;
    if (filters.type !== "all" && feedback.type !== filters.type) return false;
    if (
      filters.rating !== "all" &&
      feedback.overallRating < parseInt(filters.rating)
    )
      return false;
    if (
      filters.search &&
      !feedback.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !feedback.content.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const FeedbackDetailModal = ({ feedback, onClose }) => {
    const [response, setResponse] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-stone-800">
                Chi tiết đánh giá
              </h2>
              <div className="flex items-center gap-3">
                {getStatusBadge(feedback.status)}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-stone-500" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-stone-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-stone-800 mb-3">
                Thông tin người đánh giá
              </h3>
              {feedback.isAnonymous ? (
                <div className="flex items-center gap-2 text-stone-600">
                  <User className="h-4 w-4" />
                  <span>Người dùng ẩn danh</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-stone-600" />
                    <span className="font-medium">
                      {feedback.user?.fullName}
                    </span>
                  </div>
                  <div className="text-sm text-stone-600">
                    <div>Email: {feedback.user?.email}</div>
                    <div>Điện thoại: {feedback.user?.phone}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 text-sm text-stone-500">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(feedback.createdAt)}</span>
              </div>
            </div>

            {/* Feedback Content */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Tiêu đề</h3>
                <p className="text-stone-700">{feedback.title}</p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Nội dung</h3>
                <p className="text-stone-700 leading-relaxed">
                  {feedback.content}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-stone-800 mb-2">
                  Đánh giá tổng thể
                </h3>
                <div className="flex items-center gap-2">
                  {renderStars(feedback.overallRating)}
                  <span className="font-medium">
                    {feedback.overallRating}/5
                  </span>
                </div>
              </div>

              {/* Detailed Ratings */}
              <div>
                <h3 className="font-semibold text-stone-800 mb-3">
                  Đánh giá chi tiết
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { key: "equipment", label: "Thiết bị", icon: "🏋️" },
                    { key: "cleanliness", label: "Vệ sinh", icon: "✨" },
                    { key: "staff", label: "Nhân viên", icon: "👥" },
                    { key: "facilities", label: "Tiện ích", icon: "🏢" },
                    { key: "atmosphere", label: "Không khí", icon: "🌟" },
                  ].map((category) => (
                    <div
                      key={category.key}
                      className="text-center p-3 bg-stone-50 rounded-lg"
                    >
                      <div className="text-lg mb-1">{category.icon}</div>
                      <div className="text-xs text-stone-600 mb-1">
                        {category.label}
                      </div>
                      <div className="font-semibold text-stone-800">
                        {feedback.ratings[category.key]}/5
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {feedback.tags && feedback.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-stone-800 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {feedback.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Response */}
            {feedback.adminResponse && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Phản hồi của admin
                </h3>
                <p className="text-blue-700 mb-2">
                  {feedback.adminResponse.content}
                </p>
                <p className="text-xs text-blue-600">
                  {formatDate(feedback.adminResponse.respondedAt)}
                </p>
              </div>
            )}

            {/* Rejection Reason */}
            {feedback.status === "rejected" && feedback.rejectionReason && (
              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-2">
                  Lý do từ chối
                </h3>
                <p className="text-red-700">{feedback.rejectionReason}</p>
              </div>
            )}

            {/* Action Buttons */}
            {feedback.status === "pending" && (
              <div className="flex gap-4">
                <button
                  onClick={() => handleApproveFeedback(feedback._id)}
                  disabled={actionLoading === feedback._id}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Duyệt
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={actionLoading === feedback._id}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Từ chối
                </button>
              </div>
            )}

            {/* Delete Button for Approved Feedbacks */}
            {feedback.status === "approved" && (
              <div className="mb-4">
                <button
                  onClick={() => handleDeleteFeedback(feedback._id)}
                  disabled={actionLoading === feedback._id}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa đánh giá
                </button>
              </div>
            )}

            {/* Response Form */}
            {feedback.status === "approved" && !feedback.adminResponse && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Phản hồi cho khách hàng
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Nhập phản hồi của bạn..."
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  onClick={() =>
                    handleRespondToFeedback(feedback._id, response)
                  }
                  disabled={!response.trim() || actionLoading === feedback._id}
                  className="mt-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  Gửi phản hồi
                </button>
              </div>
            )}

            {/* Reject Form */}
            {showRejectForm && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg">
                <label className="block text-sm font-medium text-red-700 mb-2">
                  Lý do từ chối
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  rows={3}
                  className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      handleRejectFeedback(feedback._id, rejectionReason);
                      setShowRejectForm(false);
                    }}
                    disabled={
                      !rejectionReason.trim() || actionLoading === feedback._id
                    }
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Xác nhận từ chối
                  </button>
                  <button
                    onClick={() => setShowRejectForm(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">
            Quản lý đánh giá
          </h1>
          <p className="text-stone-600">
            Duyệt và phản hồi đánh giá từ khách hàng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Loại
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả</option>
              <option value="general">Đánh giá chung</option>
              <option value="class">Về lớp học</option>
              <option value="service">Về dịch vụ</option>
              <option value="complaint">Khiếu nại</option>
              <option value="suggestion">Đề xuất</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Đánh giá
            </label>
            <select
              value={filters.rating}
              onChange={(e) =>
                setFilters({ ...filters, rating: e.target.value })
              }
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao trở lên</option>
              <option value="3">3 sao trở lên</option>
              <option value="2">2 sao trở lên</option>
              <option value="1">1 sao trở lên</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">
              Không có đánh giá nào
            </h3>
            <p className="text-stone-500">
              Không tìm thấy đánh giá phù hợp với bộ lọc
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">
                    Đánh giá
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">
                    Người đánh giá
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">
                    Rating
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">
                    Trạng thái
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">
                    Ngày tạo
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback._id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-stone-800 mb-1">
                          {feedback.title}
                        </div>
                        <div className="text-sm text-stone-600 truncate max-w-xs">
                          {feedback.content}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-stone-100 rounded-full">
                            {feedback.type === "general" && "Đánh giá chung"}
                            {feedback.type === "class" && "Về lớp học"}
                            {feedback.type === "service" && "Về dịch vụ"}
                            {feedback.type === "complaint" && "Khiếu nại"}
                            {feedback.type === "suggestion" && "Đề xuất"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {feedback.isAnonymous ? (
                        <span className="text-stone-500 italic">Ẩn danh</span>
                      ) : (
                        <div>
                          <div className="font-medium text-stone-800">
                            {feedback.user?.fullName}
                          </div>
                          <div className="text-sm text-stone-600">
                            {feedback.user?.email}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {renderStars(feedback.overallRating)}
                        <span className="text-sm font-medium ml-1">
                          {feedback.overallRating}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(feedback.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {formatDate(feedback.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFeedback(feedback);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-stone-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {feedback.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleApproveFeedback(feedback._id)
                              }
                              disabled={actionLoading === feedback._id}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Duyệt"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFeedback(feedback);
                                setShowDetailModal(true);
                              }}
                              disabled={actionLoading === feedback._id}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Từ chối"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {feedback.status === "approved" && (
                          <button
                            onClick={() => handleDeleteFeedback(feedback._id)}
                            disabled={actionLoading === feedback._id}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa đánh giá"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedFeedback && (
          <FeedbackDetailModal
            feedback={selectedFeedback}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedFeedback(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackManagement;
