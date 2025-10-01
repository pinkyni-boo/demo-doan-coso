import Feedback from "../models/Feedback.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
import Class from "../models/Class.js";
import Club from "../models/Club.js";
import mongoose from "mongoose";

// Tạo feedback mới
export const createFeedback = async (req, res) => {
  try {
    console.log("=== CREATE FEEDBACK REQUEST ===");
    console.log("User ID:", req.user._id);
    console.log("Request body:", req.body);

    const userId = req.user._id;
    const {
      feedbackType,
      overallRating,
      ratings,
      title,
      content,
      type,
      tags,
      isAnonymous,
      wouldRecommend,
      images,
      clubId,
      classId,
      serviceId,
    } = req.body;

    console.log("Extracted data:", {
      feedbackType,
      overallRating,
      title,
      content,
      clubId,
    });

    // Validate required fields
    if (!feedbackType || !overallRating || !title || !content) {
      console.log("Validation failed - missing required fields");
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Tạo feedback mới
    console.log("Creating new feedback with data:", {
      user: userId,
      feedbackType,
      overallRating,
      ratings: ratings || {},
      title,
      content,
      type: type || "general",
      tags: tags || [],
      isAnonymous: isAnonymous || false,
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      images: images || [],
      clubId,
      classId,
      serviceId,
    });

    const newFeedback = new Feedback({
      user: userId,
      feedbackType,
      overallRating,
      ratings: ratings || {},
      title,
      content,
      type: type || "general",
      tags: tags || [],
      isAnonymous: isAnonymous || false,
      wouldRecommend: wouldRecommend !== undefined ? wouldRecommend : true,
      images: images || [],
      // Thêm các trường liên quan nếu có trong model
      ...(clubId && { club: clubId }),
      ...(classId && { class: classId }),
      ...(serviceId && { service: serviceId }),
    });

    console.log("Saving feedback to database...");
    const savedFeedback = await newFeedback.save();
    console.log("Feedback saved successfully:", savedFeedback._id);

    // Populate thông tin liên quan
    console.log("Populating feedback data...");
    const populatedFeedback = await Feedback.findById(savedFeedback._id)
      .populate("user", "username fullName avatar")
      .populate("club", "name")
      .populate("class", "name")
      .populate("service", "name");

    console.log("Sending success response...");
    res.status(201).json({
      success: true,
      message: "Tạo feedback thành công",
      data: populatedFeedback,
    });
  } catch (error) {
    console.error("=== ERROR CREATING FEEDBACK ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Request body:", req.body);
    console.error("User ID:", req.user?._id);

    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo feedback",
      error: error.message,
    });
  }
};

// Lấy danh sách feedback (public)
export const getFeedbacks = async (req, res) => {
  try {
    console.log("=== GET FEEDBACKS ===");
    console.log("Query params:", req.query);

    const {
      page = 1,
      limit = 10,
      feedbackType,
      type,
      rating,
      search,
      relatedService,
      relatedClass,
      relatedClub,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build filter
    const filter = {
      status: "approved",
      isPublic: true,
    };

    if (feedbackType) filter.feedbackType = feedbackType;
    if (type) filter.type = type;
    if (rating) filter.overallRating = { $gte: parseInt(rating) };
    if (relatedService) filter.relatedService = relatedService;
    if (relatedClass) filter.relatedClass = relatedClass;
    if (relatedClub) filter.relatedClub = relatedClub;

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [search] } },
      ];
    }

    console.log("Filter applied:", filter);

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get feedbacks
    const feedbacks = await Feedback.find(filter)
      .populate("user", "username fullName avatar")
      .populate("club", "name")
      .populate("class", "name")
      .populate("service", "name")
      .populate("relatedService", "name")
      .populate("relatedClass", "className")
      .populate("relatedTrainer", "username fullName")
      .populate("relatedClub", "name")
      .populate("adminResponse.respondedBy", "username fullName")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("Found feedbacks:", feedbacks.length);

    // Get total count
    const total = await Feedback.countDocuments(filter);

    // Calculate statistics
    const stats = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$overallRating" },
          totalFeedbacks: { $sum: 1 },
          ratingDistribution: {
            $push: "$overallRating",
          },
        },
      },
    ]);

    const ratingDistribution = {};
    if (stats.length > 0) {
      stats[0].ratingDistribution.forEach((rating) => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      statistics: {
        averageRating: stats.length > 0 ? stats[0].averageRating : 0,
        totalFeedbacks: stats.length > 0 ? stats[0].totalFeedbacks : 0,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error getting feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách feedback",
      error: error.message,
    });
  }
};

// Lấy feedback của user hiện tại
export const getUserFeedbacks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find({ user: userId })
      .populate("relatedService", "name")
      .populate("relatedClass", "className")
      .populate("relatedTrainer", "username fullName")
      .populate("relatedClub", "name")
      .populate("adminResponse.respondedBy", "username fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments({ user: userId });

    res.json({
      feedbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting user feedbacks:", error);
    res.status(500).json({
      message: "Lỗi khi lấy feedback của người dùng",
      error: error.message,
    });
  }
};

// Cập nhật feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Tìm feedback
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Không tìm thấy feedback" });
    }

    // Kiểm tra quyền sở hữu
    if (feedback.user.toString() !== userId) {
      return res.status(403).json({
        message: "Bạn không có quyền chỉnh sửa feedback này",
      });
    }

    // Cập nhật
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { ...updateData, status: "pending" }, // Reset status khi cập nhật
      { new: true, runValidators: true }
    )
      .populate("user", "username fullName avatar")
      .populate("relatedService", "name")
      .populate("relatedClass", "className")
      .populate("relatedTrainer", "username fullName")
      .populate("relatedClub", "name");

    res.json({
      message: "Cập nhật feedback thành công",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật feedback",
      error: error.message,
    });
  }
};

// Xóa feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Không tìm thấy feedback" });
    }

    // Kiểm tra quyền sở hữu hoặc admin
    if (feedback.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Bạn không có quyền xóa feedback này",
      });
    }

    await Feedback.findByIdAndDelete(id);

    res.json({ message: "Xóa feedback thành công" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({
      message: "Lỗi khi xóa feedback",
      error: error.message,
    });
  }
};

// Đánh dấu feedback hữu ích
export const markFeedbackHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Không tìm thấy feedback" });
    }

    const alreadyMarked = feedback.helpfulUsers.includes(userId);

    if (alreadyMarked) {
      // Bỏ đánh dấu
      feedback.helpfulUsers = feedback.helpfulUsers.filter(
        (user) => user.toString() !== userId
      );
      feedback.helpful = Math.max(0, feedback.helpful - 1);
    } else {
      // Đánh dấu hữu ích
      feedback.helpfulUsers.push(userId);
      feedback.helpful += 1;
    }

    await feedback.save();

    res.json({
      message: alreadyMarked ? "Đã bỏ đánh dấu hữu ích" : "Đã đánh dấu hữu ích",
      helpful: feedback.helpful,
      isMarked: !alreadyMarked,
    });
  } catch (error) {
    console.error("Error marking feedback helpful:", error);
    res.status(500).json({
      message: "Lỗi khi đánh dấu feedback",
      error: error.message,
    });
  }
};

// Admin: Duyệt feedback
export const approveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminResponse } = req.body;

    console.log("=== APPROVE FEEDBACK ===");
    console.log("Feedback ID:", id);
    console.log("Admin response:", adminResponse);
    console.log("Admin user:", req.user._id);

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy feedback",
      });
    }

    // Cập nhật status và thông tin approval
    feedback.status = "approved";
    feedback.approvedAt = new Date();
    feedback.approvedBy = req.user._id;

    // Thêm phản hồi của admin nếu có
    if (adminResponse && adminResponse.trim()) {
      feedback.adminResponse = {
        content: adminResponse,
        respondedBy: req.user._id,
        respondedAt: new Date(),
      };
    }

    console.log("Saving feedback with data:", {
      status: feedback.status,
      approvedAt: feedback.approvedAt,
      approvedBy: feedback.approvedBy,
      adminResponse: feedback.adminResponse,
    });

    await feedback.save();

    const updatedFeedback = await Feedback.findById(id)
      .populate("user", "username fullName avatar")
      .populate("club", "name")
      .populate("class", "name")
      .populate("service", "name")
      .populate("approvedBy", "username fullName")
      .populate("adminResponse.respondedBy", "username fullName");

    console.log("Feedback approved successfully");

    res.json({
      success: true,
      message: "Duyệt feedback thành công",
      data: updatedFeedback,
    });
  } catch (error) {
    console.error("Error approving feedback:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi duyệt feedback",
      error: error.message,
    });
  }
};

// Admin: Lấy tất cả feedback
export const getAllFeedbacks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      feedbackType,
      rating,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (feedbackType) filter.feedbackType = feedbackType;
    if (rating) filter.overallRating = { $gte: parseInt(rating) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(filter)
      .populate("user", "username fullName avatar email")
      .populate("relatedService", "name")
      .populate("relatedClass", "className")
      .populate("relatedTrainer", "username fullName")
      .populate("relatedClub", "name")
      .populate("adminResponse.respondedBy", "username fullName")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filter);

    // Get statistics
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          averageRating: { $avg: "$overallRating" },
        },
      },
    ]);

    res.json({
      feedbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
      statistics: stats,
    });
  } catch (error) {
    console.error("Error getting all feedbacks:", error);
    res.status(500).json({
      message: "Lỗi khi lấy tất cả feedback",
      error: error.message,
    });
  }
};

// Lấy thống kê feedback
export const getFeedbackStats = async (req, res) => {
  try {
    const { timeRange = "all", relatedService, relatedClub } = req.query;

    // Build time filter
    const timeFilter = {};
    if (timeRange !== "all") {
      const now = new Date();
      switch (timeRange) {
        case "week":
          timeFilter.createdAt = {
            $gte: new Date(now.setDate(now.getDate() - 7)),
          };
          break;
        case "month":
          timeFilter.createdAt = {
            $gte: new Date(now.setMonth(now.getMonth() - 1)),
          };
          break;
        case "year":
          timeFilter.createdAt = {
            $gte: new Date(now.setFullYear(now.getFullYear() - 1)),
          };
          break;
      }
    }

    // Build filter
    const filter = { status: "approved", ...timeFilter };
    if (relatedService) filter.relatedService = relatedService;
    if (relatedClub) filter.relatedClub = relatedClub;

    // Overall statistics
    const overallStats = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: "$overallRating" },
          averageServiceQuality: { $avg: "$ratings.serviceQuality" },
          averageEquipmentQuality: { $avg: "$ratings.equipmentQuality" },
          averageCleanliness: { $avg: "$ratings.cleanliness" },
          averageStaffService: { $avg: "$ratings.staffService" },
          averageValueForMoney: { $avg: "$ratings.valueForMoney" },
          averageAtmosphere: { $avg: "$ratings.atmosphere" },
        },
      },
    ]);

    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$overallRating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Feedback by type
    const feedbackByType = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$feedbackType",
          count: { $sum: 1 },
          averageRating: { $avg: "$overallRating" },
        },
      },
    ]);

    // Trend over time (monthly)
    const trend = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          averageRating: { $avg: "$overallRating" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      overallStats: overallStats[0] || {},
      ratingDistribution,
      feedbackByType,
      trend,
    });
  } catch (error) {
    console.error("Error getting feedback stats:", error);
    res.status(500).json({
      message: "Lỗi khi lấy thống kê feedback",
      error: error.message,
    });
  }
};

// Lấy thống kê feedback cho club
export const getClubFeedbackStats = async (req, res) => {
  try {
    const { clubId } = req.params;

    const stats = await Feedback.aggregate([
      { $match: { club: new mongoose.Types.ObjectId(clubId) } },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: "$overallRating" },
          averageEquipment: { $avg: "$ratings.equipment" },
          averageCleanliness: { $avg: "$ratings.cleanliness" },
          averageStaff: { $avg: "$ratings.staff" },
          averageFacilities: { $avg: "$ratings.facilities" },
          averageAtmosphere: { $avg: "$ratings.atmosphere" },
          recommendationRate: {
            $avg: { $cond: [{ $eq: ["$wouldRecommend", true] }, 1, 0] },
          },
          ratingDistribution: { $push: "$overallRating" },
        },
      },
    ]);

    if (!stats.length) {
      return res.json({
        totalFeedbacks: 0,
        averageRating: 0,
        categoryAverages: {},
        recommendationRate: 0,
        distribution: [],
        recentFeedbacks: [],
      });
    }

    const stat = stats[0];

    // Tính phân bố rating
    const distribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count: stat.ratingDistribution.filter((r) => r === rating).length,
      percentage:
        stat.totalFeedbacks > 0
          ? (
              (stat.ratingDistribution.filter((r) => r === rating).length /
                stat.totalFeedbacks) *
              100
            ).toFixed(1)
          : 0,
    }));

    // Lấy feedback gần đây
    const recentFeedbacks = await Feedback.find({ club: clubId })
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalFeedbacks: stat.totalFeedbacks,
      averageRating: Number(stat.averageRating.toFixed(1)),
      categoryAverages: {
        equipment: Number(stat.averageEquipment.toFixed(1)),
        cleanliness: Number(stat.averageCleanliness.toFixed(1)),
        staff: Number(stat.averageStaff.toFixed(1)),
        facilities: Number(stat.averageFacilities.toFixed(1)),
        atmosphere: Number(stat.averageAtmosphere.toFixed(1)),
      },
      recommendationRate: Number((stat.recommendationRate * 100).toFixed(1)),
      distribution,
      recentFeedbacks,
    });
  } catch (error) {
    console.error("Error getting club feedback stats:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy thống kê feedback",
      error: error.message,
    });
  }
};

// ADMIN ONLY FUNCTIONS

// Lấy tất cả feedback cho admin
export const getAllFeedbacksForAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "all",
      type = "all",
      rating = "all",
      search = "",
    } = req.query;

    // Build filter object
    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    if (type !== "all") {
      filter.type = type;
    }

    if (rating !== "all") {
      filter.overallRating = { $gte: parseInt(rating) };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(filter)
      .populate("user", "fullName email phone username")
      .populate("club", "name")
      .populate("class", "name")
      .populate("service", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error getting all feedbacks for admin:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách feedback",
      error: error.message,
    });
  }
};

// Từ chối feedback
export const rejectFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log("=== REJECT FEEDBACK ===");
    console.log("Feedback ID:", id);
    console.log("Rejection reason:", reason);
    console.log("Admin user:", req.user._id);

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do từ chối",
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: req.user._id,
      },
      { new: true }
    )
      .populate("user", "fullName email username avatar")
      .populate("club", "name")
      .populate("class", "name")
      .populate("service", "name")
      .populate("rejectedBy", "username fullName");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy feedback",
      });
    }

    console.log("Feedback rejected successfully");

    res.json({
      success: true,
      message: "Đã từ chối feedback thành công",
      data: feedback,
    });
  } catch (error) {
    console.error("Error rejecting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi từ chối feedback",
      error: error.message,
    });
  }
};

// Phản hồi feedback
export const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        message: "Vui lòng nhập nội dung phản hồi",
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        adminResponse: {
          content: response,
          respondedAt: new Date(),
          respondedBy: req.user._id,
        },
      },
      { new: true }
    )
      .populate("user", "fullName email")
      .populate("adminResponse.respondedBy", "fullName");

    if (!feedback) {
      return res.status(404).json({
        message: "Không tìm thấy feedback",
      });
    }

    res.json({
      success: true,
      message: "Đã gửi phản hồi thành công",
      data: feedback,
    });
  } catch (error) {
    console.error("Error responding to feedback:", error);
    res.status(500).json({
      message: "Lỗi server khi phản hồi feedback",
      error: error.message,
    });
  }
};

// Lấy thống kê feedback cho admin
export const getFeedbackStatsForAdmin = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments();
    const pendingFeedbacks = await Feedback.countDocuments({
      status: "pending",
    });
    const approvedFeedbacks = await Feedback.countDocuments({
      status: "approved",
    });
    const rejectedFeedbacks = await Feedback.countDocuments({
      status: "rejected",
    });

    // Get average rating
    const avgRatingResult = await Feedback.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$overallRating" },
        },
      },
    ]);

    const averageRating =
      avgRatingResult.length > 0 ? avgRatingResult[0].averageRating : 0;

    // Get rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$overallRating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent feedbacks
    const recentFeedbacks = await Feedback.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        total: totalFeedbacks,
        pending: pendingFeedbacks,
        approved: approvedFeedbacks,
        rejected: rejectedFeedbacks,
        averageRating: Number(averageRating.toFixed(1)),
        ratingDistribution,
        recentFeedbacks,
      },
    });
  } catch (error) {
    console.error("Error getting feedback stats for admin:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy thống kê feedback",
      error: error.message,
    });
  }
};
