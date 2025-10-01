import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Search,
  Plus,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import FeedbackForm from "./FeedbackForm";

const FeedbackPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    rating: "",
    type: "",
    sortBy: "createdAt",
    order: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    fetchFeedbacks();
    if (clubId) {
      fetchClubStats();
    }
  }, [clubId, filters, pagination.currentPage, searchTerm]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);

      // Build query params
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "10",
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.type && { type: filters.type }),
        ...(searchTerm && { search: searchTerm }),
        sortBy: filters.sortBy,
        order: filters.order,
      });

      // Call real API to get feedbacks
      const response = await axios.get(
        `http://localhost:5000/api/feedback?${queryParams.toString()}`
      );

      console.log("Feedback API response:", response.data);

      if (response.data.success) {
        console.log("Setting feedbacks:", response.data.data);
        setFeedbacks(response.data.data || []);
        if (response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages,
            totalItems: response.data.pagination.totalItems,
          });
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      if (error.response?.status !== 404) {
        toast.error("Không thể tải danh sách đánh giá");
      }
      // Set empty data on error
      setFeedbacks([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClubStats = async () => {
    try {
      if (!clubId) return;

      console.log("Fetching club stats for", clubId);

      // Call real API to get club feedback stats
      const response = await axios.get(
        `http://localhost:5000/api/feedback/club/${clubId}/stats`
      );

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        console.warn("Failed to fetch club stats:", response.data.message);
        // Set default stats if API fails
        setStats({
          totalFeedbacks: 0,
          averageRating: 0,
          recommendationRate: 0,
          distribution: [],
        });
      }
    } catch (error) {
      console.error("Error fetching club stats:", error);
      // Set default stats on error
      setStats({
        totalFeedbacks: 0,
        averageRating: 0,
        recommendationRate: 0,
        distribution: [],
      });
    }
  };

  const handleCreateFeedback = () => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      toast.error("Vui lòng đăng nhập để viết đánh giá");
      navigate("/login");
      return;
    }

    setShowForm(true);
  };

  const handleFeedbackSubmitted = (newFeedback) => {
    console.log("New feedback submitted:", newFeedback);
    setShowForm(false);
    toast.success("Gửi đánh giá thành công!");

    // Refresh feedbacks and stats from API
    fetchFeedbacks();
    if (clubId) {
      fetchClubStats();
    }
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const FeedbackCard = ({ feedback }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {!feedback.isAnonymous && feedback.user ? (
            <div className="flex items-center gap-3">
              {feedback.user.avatar?.url ? (
                <img
                  src={feedback.user.avatar.url}
                  alt={feedback.user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {feedback.user.fullName?.charAt(0) ||
                      feedback.user.username?.charAt(0) ||
                      "U"}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-stone-800">
                  {feedback.user.fullName || feedback.user.username}
                </h4>
                <p className="text-sm text-stone-500">
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-400 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800">
                  Người dùng ẩn danh
                </h4>
                <p className="text-sm text-stone-500">
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(feedback.overallRating)}
          </div>
          <span className="text-sm font-semibold text-stone-700">
            {feedback.overallRating}/5
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-semibold text-stone-800 mb-2 text-lg">
          {feedback.title}
        </h3>
        <p className="text-stone-600 leading-relaxed">{feedback.content}</p>
      </div>

      {/* Category Ratings */}
      {feedback.ratings && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4 p-4 bg-stone-50 rounded-xl">
          {[
            { key: "serviceQuality", label: "Dịch vụ", icon: "🛎️" },
            { key: "equipmentQuality", label: "Thiết bị", icon: "🏋️" },
            { key: "cleanliness", label: "Vệ sinh", icon: "✨" },
            { key: "staffService", label: "Nhân viên", icon: "👥" },
            { key: "valueForMoney", label: "Giá trị", icon: "💰" },
            { key: "atmosphere", label: "Không khí", icon: "🌟" },
          ]
            .filter((category) => feedback.ratings[category.key] > 0)
            .map((category) => (
              <div key={category.key} className="text-center">
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
      )}

      {/* Tags */}
      {feedback.tags && feedback.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {feedback.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Recommendation */}
      {feedback.wouldRecommend !== undefined && (
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp
            className={`h-4 w-4 ${
              feedback.wouldRecommend ? "text-green-600" : "text-red-600"
            }`}
          />
          <span className="text-sm text-stone-600">
            {feedback.wouldRecommend
              ? "Sẽ giới thiệu cho bạn bè"
              : "Không giới thiệu"}
          </span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-stone-800 mb-4">
              Đánh giá từ thành viên
            </h1>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Chia sẻ trải nghiệm và đọc phản hồi từ cộng đồng Royal Fitness
            </p>
          </motion.div>

          {/* Stats Overview */}
          {stats.totalFeedbacks > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {stats.averageRating}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <div className="text-sm text-stone-600">
                  Đánh giá trung bình
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalFeedbacks}
                </div>
                <div className="text-sm text-stone-600">Tổng đánh giá</div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.recommendationRate}%
                </div>
                <div className="text-sm text-stone-600">Tỷ lệ giới thiệu</div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.distribution?.find((d) => d.rating === 5)?.count || 0}
                </div>
                <div className="text-sm text-stone-600">Đánh giá 5 sao</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm đánh giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent min-w-[300px]"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filters.rating}
                onChange={(e) =>
                  setFilters({ ...filters, rating: e.target.value })
                }
                className="px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Tất cả đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao trở lên</option>
                <option value="3">3 sao trở lên</option>
                <option value="2">2 sao trở lên</option>
                <option value="1">1 sao trở lên</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className="px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Tất cả loại</option>
                <option value="general">Đánh giá chung</option>
                <option value="class">Về lớp học</option>
                <option value="service">Về dịch vụ</option>
                <option value="complaint">Khiếu nại</option>
                <option value="suggestion">Đề xuất</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateFeedback}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Viết đánh giá
          </motion.button>
        </div>

        {/* Feedback List */}
        <div className="space-y-6">
          <AnimatePresence>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <FeedbackCard key={feedback._id} feedback={feedback} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <MessageSquare className="h-16 w-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-700 mb-2">
                  Chưa có đánh giá nào
                </h3>
                <p className="text-stone-500 mb-6">
                  Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateFeedback}
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all"
                >
                  Viết đánh giá đầu tiên
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full max-h-[90vh] overflow-auto"
            >
              <FeedbackForm
                clubId={clubId}
                onClose={() => setShowForm(false)}
                onSubmit={handleFeedbackSubmitted}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackPage;
