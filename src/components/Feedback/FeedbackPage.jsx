import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({});
  const [overallStats, setOverallStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    rating: "",
    type: "",
    feedbackType: "",
    sortBy: "createdAt",
    order: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [showMyFeedback, setShowMyFeedback] = useState(false);

  // Handle navigation state to automatically switch to "My Feedback"
  useEffect(() => {
    if (location.state?.showMyFeedback) {
      setShowMyFeedback(true);
      // Show a message indicating this is the user's feedback
      if (location.state?.className) {
        toast.info(`📝 Hiển thị đánh giá của bạn cho lớp "${location.state.className}"`);
      }
    }
  }, [location.state]);

  // Debounce search term với delay ngắn hơn
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Giảm từ 500ms xuống 300ms để responsive hơn

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Thêm debug vào FeedbackPage.jsx
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("🔍 Current user from localStorage:", userData);
    console.log("🔍 User role:", userData.role);
    console.log("🔍 User ID:", userData._id);
    setUser(userData);
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);

      // Determine API endpoint based on showMyFeedback
      let apiUrl;
      const token = localStorage.getItem("token");
      
      if (showMyFeedback && token) {
        // Fetch user's own feedbacks (including pending ones)
        apiUrl = `http://localhost:5000/api/feedback/my-feedbacks`;
        
        console.log("🔍 DEBUG REQUEST INFO:");
        console.log("- Current user ID from state:", user?._id);
        console.log("- User role:", user?.role);
        console.log("- User name:", user?.fullName);
        console.log("- Token exists:", !!token);
        console.log("- API URL:", apiUrl);
        
        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("🔍 BACKEND RESPONSE:");
        console.log("- Response status:", response.status);
        console.log("- Response data:", response.data);
        
        if (response.data.feedbacks) {
          console.log("🔍 FEEDBACKS ANALYSIS:");
          response.data.feedbacks.forEach((feedback, index) => {
            console.log(`Feedback ${index + 1}:`, {
              feedbackId: feedback._id,
              feedbackUserId: feedback.user,
              feedbackUserType: typeof feedback.user,
              feedbackTitle: feedback.title,
              feedbackClass: feedback.class?.className || 'No class',
              feedbackStatus: feedback.status,
              isCurrentUser: feedback.user === user?._id,
              currentUserId: user?._id
            });
          });
        }
        
        if (response.data.feedbacks) {
          setFeedbacks(response.data.feedbacks || []);
          if (response.data.pagination) {
            setPagination({
              currentPage: response.data.pagination.currentPage,
              totalPages: response.data.pagination.totalPages,
              totalItems: response.data.pagination.totalItems,
            });
          }
        }
      } else {
        // Fetch public feedbacks (approved only)
        const queryParams = new URLSearchParams({
          page: pagination.currentPage.toString(),
          limit: "10",
          ...(filters.rating && { rating: filters.rating }),
          ...(filters.type && { type: filters.type }),
          ...(filters.feedbackType && { feedbackType: filters.feedbackType }),
          ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
          sortBy: filters.sortBy,
          order: filters.order,
        });

        apiUrl = `http://localhost:5000/api/feedback?${queryParams.toString()}`;
        
        const response = await axios.get(apiUrl);
        
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
  }, [
    pagination.currentPage,
    filters.rating,
    filters.type,
    filters.feedbackType,
    filters.sortBy,
    filters.order,
    debouncedSearchTerm,
    showMyFeedback, // Add showMyFeedback to dependencies
  ]);

  const fetchClubStats = useCallback(async () => {
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
  }, [clubId]);

  const fetchOverallStats = useCallback(async () => {
    try {
      console.log("Fetching overall feedback stats");

      // Call API to get overall feedback stats
      const response = await axios.get(
        `http://localhost:5000/api/feedback/stats`
      );

      if (response.data.success) {
        setOverallStats(response.data.data);
      } else {
        console.warn("Failed to fetch overall stats:", response.data.message);
        setOverallStats({
          totalFeedbacks: 0,
          averageRating: 0,
          recommendationRate: 0,
          distribution: [],
        });
      }
    } catch (error) {
      console.error("Error fetching overall stats:", error);
      setOverallStats({
        totalFeedbacks: 0,
        averageRating: 0,
        recommendationRate: 0,
        distribution: [],
      });
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
    if (clubId) {
      fetchClubStats();
    } else {
      // Fetch overall stats when not viewing a specific club
      fetchOverallStats();
    }
  }, [fetchClubStats, fetchOverallStats, clubId]);

  const handleCreateFeedback = useCallback(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token || token === "null" || token === "undefined") {
      toast.error("Vui lòng đăng nhập để viết đánh giá");
      navigate("/login");
      return;
    }

    setShowForm(true);
  }, [navigate]);

  const handleFeedbackSubmitted = useCallback(
    (newFeedback) => {
      console.log("New feedback submitted:", newFeedback);
      setShowForm(false);
      toast.success("Gửi đánh giá thành công!");

      // Refresh feedbacks and stats from API
      fetchFeedbacks();
      if (clubId) {
        fetchClubStats();
      }
    },
    [fetchFeedbacks, fetchClubStats, clubId]
  );

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    // Reset to first page when filters change
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    // Reset to first page when search changes
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  }, []);

  const handleToggleMyFeedback = useCallback((showMy) => {
    setShowMyFeedback(showMy);
    // Reset pagination when switching views
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    // Reset filters when switching to my feedback
    if (showMy) {
      setFilters({
        rating: "",
        type: "",
        feedbackType: "",
        sortBy: "createdAt",
        order: "desc",
      });
      setSearchTerm("");
    }
  }, []);

  const renderStars = useCallback((rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "text-yellow-500 fill-current" : "text-gray-300"
        }`}
      />
    ));
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const FeedbackCard = useMemo(
    () =>
      ({ feedback }) =>
        (
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
                {/* Status indicator for my feedback */}
                {showMyFeedback && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                    feedback.status === 'approved' 
                      ? 'bg-green-100 text-green-700'
                      : feedback.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : feedback.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {feedback.status === 'approved' 
                      ? '✓ Đã duyệt'
                      : feedback.status === 'pending'
                      ? '⏳ Chờ duyệt'
                      : feedback.status === 'rejected'
                      ? '✗ Từ chối'
                      : 'Không xác định'
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h3 className="font-semibold text-stone-800 mb-2 text-lg">
                {feedback.title}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {feedback.content}
              </p>

             

              {/* Show trainer info for trainer feedback */}
              {feedback.feedbackType === "trainer" && feedback.trainer && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 font-medium">
                      👨‍🏫 Huấn luyện viên:
                    </span>
                    <span className="text-blue-800 font-semibold">
                      {feedback.trainer.fullName || feedback.trainer.username}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Category Ratings - Hide for trainer feedback */}
            {feedback.ratings && feedback.feedbackType !== "trainer" && (
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
        ),
    [formatDate, renderStars, showMyFeedback]
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
              {showMyFeedback ? "Đánh giá của tôi" : "Đánh giá từ thành viên"}
            </h1>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              {showMyFeedback 
                ? "Xem tất cả đánh giá bạn đã gửi. Đánh giá 'Chờ duyệt' sẽ hiển thị sau khi admin xác nhận."
                : "Chia sẻ trải nghiệm và đọc phản hồi từ cộng đồng Royal Fitness"
              }
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
            

            {/* Filters */}
            <div className="flex gap-3">
              <select
                id="rating-filter"
                name="ratingFilter"
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className="px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Lọc đánh giá</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao trở lên</option>
                <option value="3">3 sao trở lên</option>
                <option value="2">2 sao trở lên</option>
                <option value="1">1 sao trở lên</option>
              </select>

            </div>
          </div>

          
        </div>

        {/* Overall Stats Summary */}
        {(overallStats.totalFeedbacks > 0 || stats.totalFeedbacks > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {clubId
                      ? (stats.averageRating || 0).toFixed(1)
                      : (overallStats.averageRating || 0).toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-1">
                    {renderStars(
                      Math.round(
                        clubId
                          ? stats.averageRating
                          : overallStats.averageRating
                      )
                    )}
                  </div>
                  <div className="text-sm text-stone-600">Điểm trung bình</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {clubId
                      ? stats.totalFeedbacks
                      : overallStats.totalFeedbacks}
                  </div>
                  <div className="text-sm text-stone-600">Tổng đánh giá</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {clubId
                      ? `${stats.recommendationRate || 0}%`
                      : `${overallStats.recommendationRate || 0}%`}
                  </div>
                  <div className="text-sm text-stone-600">Tỷ lệ giới thiệu</div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-600 mr-2">Phân bố:</span>
                {Array.from({ length: 5 }, (_, index) => {
                  const rating = 5 - index;
                  const distribution = clubId
                    ? stats.distribution
                    : overallStats.distribution;
                  const count =
                    distribution?.find((d) => d.rating === rating)?.count || 0;
                  const total = clubId
                    ? stats.totalFeedbacks
                    : overallStats.totalFeedbacks;
                  const percentage =
                    total > 0 ? ((count / total) * 100).toFixed(0) : 0;

                  return (
                    <div
                      key={rating}
                      className="flex items-center gap-1 text-xs"
                    >
                      <span className="text-stone-500">{rating}★</span>
                      <div className="w-12 h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-stone-500 w-8">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback List */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            ) : feedbacks.length > 0 ? (
              <motion.div
                key="feedbacks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {feedbacks.map((feedback) => (
                  <FeedbackCard key={feedback._id} feedback={feedback} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <MessageSquare className="h-16 w-16 text-stone-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-stone-700 mb-2">
                  {showMyFeedback ? "Bạn chưa có đánh giá nào" : "Chưa có đánh giá nào"}
                </h3>
                
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        {feedbacks.length > 0 && pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center items-center gap-2 mt-8"
          >
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>

            {useMemo(
              () =>
                Array.from({ length: pagination.totalPages }, (_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === pagination.currentPage;
                  const shouldShow =
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.currentPage) <= 2;

                  if (!shouldShow) {
                    // Show ellipsis for gaps
                    if (
                      page === pagination.currentPage - 3 ||
                      page === pagination.currentPage + 3
                    ) {
                      return (
                        <span key={page} className="px-2 text-stone-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        isCurrentPage
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-stone-300 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }),
              [pagination.totalPages, pagination.currentPage, handlePageChange]
            )}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </motion.div>
        )}
      </div>

      {/* Feedback Form Modal */}
      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
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
