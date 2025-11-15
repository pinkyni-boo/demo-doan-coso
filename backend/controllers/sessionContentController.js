import SessionContent from "../models/SessionContent.js";
import Class from "../models/Class.js";
import mongoose from "mongoose";

// Tạo hoặc cập nhật nội dung buổi học
export const createOrUpdateSessionContent = async (req, res) => {
  try {
    const { classId, sessionNumber, title, content, objectives, exercises, notes } = req.body;
    const userId = req.user.id || req.user._id;

    // Validate input
    if (!classId || !sessionNumber || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: classId, sessionNumber, title, content"
      });
    }

    // Kiểm tra lớp học có tồn tại
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: "Lớp học không tồn tại"
      });
    }

    // Kiểm tra session number hợp lệ
    if (sessionNumber < 1 || sessionNumber > classExists.totalSessions) {
      return res.status(400).json({
        success: false,
        message: `Số buổi học không hợp lệ. Lớp này có ${classExists.totalSessions} buổi`
      });
    }

    // Tìm và cập nhật hoặc tạo mới
    const sessionContent = await SessionContent.findOneAndUpdate(
      { class: classId, sessionNumber },
      {
        title,
        content,
        objectives: objectives || "",
        exercises: exercises || "",
        notes: notes || "",
        createdBy: userId,
        updatedBy: userId
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: "Lưu nội dung buổi học thành công",
      data: sessionContent
    });
  } catch (error) {
    console.error("Error creating/updating session content:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lưu nội dung buổi học",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Lấy nội dung một buổi học
export const getSessionContent = async (req, res) => {
  try {
    const { classId, sessionNumber } = req.params;

    const sessionContent = await SessionContent.findOne({
      class: classId,
      sessionNumber: parseInt(sessionNumber)
    }).populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    if (!sessionContent) {
      return res.status(200).json({
        success: true,
        content: null,
        message: "Chưa có nội dung cho buổi học này"
      });
    }

    res.status(200).json({
      success: true,
      content: sessionContent
    });
  } catch (error) {
    console.error("Error getting session content:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy nội dung buổi học",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Lấy tất cả nội dung các buổi học của một lớp
export const getClassSessionContents = async (req, res) => {
  try {
    const { classId } = req.params;

    const sessionContents = await SessionContent.find({
      class: classId
    }).sort({ sessionNumber: 1 })
      .populate("createdBy", "fullName email")
      .populate("updatedBy", "fullName email");

    res.status(200).json({
      success: true,
      data: sessionContents
    });
  } catch (error) {
    console.error("Error getting class session contents:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy nội dung các buổi học",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Xóa nội dung buổi học
export const deleteSessionContent = async (req, res) => {
  try {
    const { classId, sessionNumber } = req.params;

    const result = await SessionContent.findOneAndDelete({
      class: classId,
      sessionNumber: parseInt(sessionNumber)
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nội dung buổi học"
      });
    }

    res.status(200).json({
      success: true,
      message: "Xóa nội dung buổi học thành công"
    });
  } catch (error) {
    console.error("Error deleting session content:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa nội dung buổi học",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
