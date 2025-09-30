import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Star,
  X,
  Send,
  AlertCircle,
  Eye,
  EyeOff,
  Tag,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from "react-toastify";

const FeedbackForm = ({ clubId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    feedbackType: "general",
    overallRating: 0,
    ratings: {
      serviceQuality: 0,
      equipmentQuality: 0,
      cleanliness: 0,
      staffService: 0,
      valueForMoney: 0,
      atmosphere: 0,
    },
    wouldRecommend: null,
    isAnonymous: false,
    tags: [],
  });

  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const feedbackTypes = [
    { value: "general", label: "Đánh giá chung", icon: "⭐" },
    { value: "class", label: "Về lớp học", icon: "🏃" },
    { value: "service", label: "Về dịch vụ", icon: "🛎️" },
    { value: "facility", label: "Về cơ sở", icon: "🏢" },
    { value: "trainer", label: "Về huấn luyện viên", icon: "�" },
  ];

  const ratingCategories = [
    {
      key: "serviceQuality",
      label: "Dịch vụ",
      icon: "🛎️",
      description: "Chất lượng dịch vụ tổng thể",
    },
    {
      key: "equipmentQuality",
      label: "Thiết bị",
      icon: "🏋️",
      description: "Chất lượng máy tập và dụng cụ",
    },
    {
      key: "cleanliness",
      label: "Vệ sinh",
      icon: "✨",
      description: "Tình trạng sạch sẽ của phòng tập",
    },
    {
      key: "staffService",
      label: "Nhân viên",
      icon: "👥",
      description: "Thái độ và hỗ trợ của nhân viên",
    },
    {
      key: "valueForMoney",
      label: "Giá trị",
      icon: "💰",
      description: "Mức giá so với chất lượng",
    },
    {
      key: "atmosphere",
      label: "Không khí",
      icon: "🌟",
      description: "Môi trường tập luyện",
    },
  ];

  const suggestedTags = [
    "equipment",
    "cleanliness",
    "staff",
    "price",
    "schedule",
    "facilities",
    "music",
    "temperature",
    "crowding",
    "parking",
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Vui lòng nhập nội dung đánh giá";
    }

    if (formData.overallRating === 0) {
      newErrors.overallRating = "Vui lòng chọn số sao đánh giá";
    }

    if (!formData.feedbackType) {
      newErrors.feedbackType = "Vui lòng chọn loại đánh giá";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStarClick = (rating, category = null) => {
    if (category) {
      setFormData({
        ...formData,
        ratings: {
          ...formData.ratings,
          [category]: rating,
        },
      });
    } else {
      setFormData({
        ...formData,
        overallRating: rating,
      });
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();

    // Chỉ cho phép tags từ enum có sẵn hoặc "other"
    const allowedTags = [...suggestedTags, "other"];

    if (
      trimmedTag &&
      allowedTags.includes(trimmedTag) &&
      !formData.tags.includes(trimmedTag)
    ) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      });
      setNewTag("");
    } else if (trimmedTag && !allowedTags.includes(trimmedTag)) {
      // Nếu tag không trong danh sách cho phép, thêm vào "other"
      if (!formData.tags.includes("other")) {
        setFormData({
          ...formData,
          tags: [...formData.tags, "other"],
        });
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSuggestedTagClick = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token || token === "null" || token === "undefined") {
        toast.error("Vui lòng đăng nhập để gửi đánh giá");
        return;
      }

      // Prepare data for submission - remove unnecessary fields
      const cleanedRatings = {};
      Object.keys(formData.ratings).forEach((key) => {
        if (formData.ratings[key] > 0) {
          cleanedRatings[key] = formData.ratings[key];
        }
      });

      const submissionData = {
        title: formData.title,
        content: formData.content,
        feedbackType: formData.feedbackType,
        type: formData.type,
        overallRating: formData.overallRating,
        ratings: cleanedRatings,
        wouldRecommend: formData.wouldRecommend,
        isAnonymous: formData.isAnonymous,
        tags: formData.tags.filter((tag) => tag && tag.trim()),
        ...(clubId && { clubId }),
      };

      console.log("Submitting feedback data:", submissionData);
      console.log("API endpoint:", "http://localhost:5000/api/feedback");
      console.log("Headers:", {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      const response = await axios.post(
        "http://localhost:5000/api/feedback",
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("Feedback submitted successfully:", response.data);
        onSubmit(response.data.data);
        toast.success("Gửi đánh giá thành công!");
      } else {
        throw new Error(response.data.message || "Không thể gửi đánh giá");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);

      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể gửi đánh giá. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, onStarClick, category = null) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => onStarClick(index + 1, category)}
        className={`h-8 w-8 transition-colors ${
          index < rating
            ? "text-yellow-500 hover:text-yellow-600"
            : "text-gray-300 hover:text-yellow-400"
        }`}
      >
        <Star className="h-full w-full fill-current" />
      </button>
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Viết đánh giá</h2>
          <p className="text-stone-600 mt-1">
            Chia sẻ trải nghiệm của bạn với cộng đồng
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-stone-500" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-3">
            Loại đánh giá
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {feedbackTypes.map((feedbackType) => (
              <button
                key={feedbackType.value}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    type: feedbackType.value,
                    feedbackType: feedbackType.value,
                  })
                }
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  formData.feedbackType === feedbackType.value
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="text-lg mb-1">{feedbackType.icon}</div>
                <div className="text-xs font-medium">{feedbackType.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Overall Rating */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-3">
            Đánh giá tổng thể *
          </label>
          <div className="flex items-center gap-2 mb-2">
            {renderStars(formData.overallRating, handleStarClick)}
            <span className="ml-3 text-sm text-stone-600">
              {formData.overallRating > 0 && `${formData.overallRating}/5 sao`}
            </span>
          </div>
          {errors.overallRating && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.overallRating}
            </p>
          )}
        </div>

        {/* Category Ratings */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-3">
            Đánh giá chi tiết
          </label>
          <div className="space-y-4">
            {ratingCategories.map((category) => (
              <div
                key={category.key}
                className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <div className="font-medium text-stone-800">
                      {category.label}
                    </div>
                    <div className="text-sm text-stone-600">
                      {category.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(
                    formData.ratings[category.key],
                    handleStarClick,
                    category.key
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Tiêu đề *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Nhập tiêu đề cho đánh giá của bạn"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
              errors.title ? "border-red-500" : "border-stone-300"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Nội dung đánh giá *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
              errors.content ? "border-red-500" : "border-stone-300"
            }`}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.content}
            </p>
          )}
        </div>

        {/* Recommendation */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-3">
            Bạn có giới thiệu cho bạn bè không?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, wouldRecommend: true })}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                formData.wouldRecommend === true
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              Có, tôi sẽ giới thiệu
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, wouldRecommend: false })
              }
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                formData.wouldRecommend === false
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <ThumbsDown className="h-5 w-5" />
              Không
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-3">
            Thẻ đánh giá
          </label>

          {/* Current tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-amber-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add new tag */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              placeholder="Thêm thẻ..."
              className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
            >
              <Tag className="h-4 w-4" />
            </button>
          </div>

          {/* Suggested tags */}
          <div>
            <p className="text-xs text-stone-600 mb-2">Thẻ gợi ý:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags
                .filter((tag) => !formData.tags.includes(tag))
                .map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestedTagClick(tag)}
                    className="px-2 py-1 bg-stone-100 text-stone-700 text-xs rounded-full hover:bg-stone-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Anonymous option */}
        <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, isAnonymous: !formData.isAnonymous })
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              formData.isAnonymous
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-stone-300 hover:border-stone-400"
            }`}
          >
            {formData.isAnonymous ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {formData.isAnonymous ? "Đánh giá ẩn danh" : "Hiển thị tên"}
          </button>
          <p className="text-sm text-stone-600">
            {formData.isAnonymous
              ? "Tên của bạn sẽ không được hiển thị"
              : "Tên và avatar của bạn sẽ được hiển thị"}
          </p>
        </div>

        {/* Submit buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50 transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Gửi đánh giá
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
