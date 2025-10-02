import express from "express";
import Equipment from "../models/Equipment.js";
import Room from "../models/Room.js";
import {
  verifyToken,
  verifyAdmin,
  verifyAdminOrTrainer,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy danh sách thiết bị
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      condition,
      category,
      room: roomId,
      search,
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (condition) filter.condition = condition;
    if (category) filter.category = category;
    if (roomId) filter.room = roomId;

    // Search filter
    if (search) {
      filter.$or = [
        { equipmentName: { $regex: search, $options: "i" } },
        { equipmentCode: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const equipment = await Equipment.find(filter)
      .populate("room", "roomName roomCode")
      .populate("lastReportedBy", "fullName")
      .sort({ equipmentCode: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Equipment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        equipment,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total,
          hasNext: skip + equipment.length < total,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error getting equipment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách thiết bị",
    });
  }
});

// Tạo thiết bị mới (Admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      equipmentName,
      equipmentCode,
      category,
      brand,
      model,
      purchaseDate,
      purchasePrice,
      room: roomId,
      warranty,
      specifications,
      supplier,
    } = req.body;

    // Check if equipment code already exists
    const existingEquipment = await Equipment.findOne({ equipmentCode });
    if (existingEquipment) {
      return res.status(400).json({
        success: false,
        message: "Mã thiết bị đã tồn tại",
      });
    }

    // Verify room exists
    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "Phòng tập không tồn tại",
        });
      }
    }

    const equipment = new Equipment({
      equipmentName,
      equipmentCode,
      category,
      brand,
      model,
      purchaseDate: new Date(purchaseDate),
      purchasePrice,
      room: roomId,
      warranty,
      specifications,
      supplier,
    });

    await equipment.save();

    // Populate room info
    await equipment.populate("room", "roomName roomCode");

    res.status(201).json({
      success: true,
      message: "Đã tạo thiết bị thành công",
      data: equipment,
    });
  } catch (error) {
    console.error("Error creating equipment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo thiết bị",
    });
  }
});

// Cập nhật thiết bị (Admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating equipmentCode, check for duplicates
    if (updateData.equipmentCode) {
      const existingEquipment = await Equipment.findOne({
        equipmentCode: updateData.equipmentCode,
        _id: { $ne: id },
      });
      if (existingEquipment) {
        return res.status(400).json({
          success: false,
          message: "Mã thiết bị đã tồn tại",
        });
      }
    }

    // If updating room, verify room exists
    if (updateData.room) {
      const room = await Room.findById(updateData.room);
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "Phòng tập không tồn tại",
        });
      }
    }

    const equipment = await Equipment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("room", "roomName roomCode");

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thiết bị",
      });
    }

    res.json({
      success: true,
      message: "Đã cập nhật thiết bị thành công",
      data: equipment,
    });
  } catch (error) {
    console.error("Error updating equipment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật thiết bị",
    });
  }
});

// Báo cáo vấn đề thiết bị (Trainer có thể báo cáo)
router.post(
  "/:id/report",
  verifyToken,
  verifyAdminOrTrainer,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { issueType, description, severity, images } = req.body;

      const equipment = await Equipment.findById(id);
      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thiết bị",
        });
      }

      // Add report to history
      const reportData = {
        reportedBy: req.user._id,
        issueType,
        description,
        severity: severity || "medium",
        images: images || [],
      };

      const updatedEquipment = await Equipment.findByIdAndUpdate(
        id,
        {
          $push: {
            reportHistory: reportData,
            currentIssues: description,
          },
          lastReportedBy: req.user._id,
          lastReportedAt: new Date(),
        },
        { new: true }
      ).populate([
        { path: "room", select: "roomName roomCode" },
        { path: "lastReportedBy", select: "fullName" },
      ]);

      res.json({
        success: true,
        message: "Đã báo cáo vấn đề thiết bị",
        data: updatedEquipment,
      });
    } catch (error) {
      console.error("Error reporting equipment issue:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi báo cáo vấn đề thiết bị",
      });
    }
  }
);

// Cập nhật tình trạng thiết bị (Admin only)
router.patch("/:id/condition", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, status, notes } = req.body;

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      {
        condition,
        status: status || equipment.status,
        $push: {
          reportHistory: {
            reportedBy: req.user._id,
            issueType: "condition_update",
            description: notes || `Cập nhật tình trạng thành ${condition}`,
            severity: "low",
          },
        },
      },
      { new: true }
    ).populate("room", "roomName roomCode");

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thiết bị",
      });
    }

    res.json({
      success: true,
      message: "Đã cập nhật tình trạng thiết bị",
      data: equipment,
    });
  } catch (error) {
    console.error("Error updating equipment condition:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật tình trạng thiết bị",
    });
  }
});

// Xóa thiết bị (Admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findByIdAndDelete(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thiết bị",
      });
    }

    res.json({
      success: true,
      message: "Đã xóa thiết bị thành công",
    });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa thiết bị",
    });
  }
});

// Lấy chi tiết thiết bị và lịch sử
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id)
      .populate("room", "roomName roomCode location")
      .populate("lastReportedBy", "fullName")
      .populate("reportHistory.reportedBy", "fullName");

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thiết bị",
      });
    }

    res.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error("Error getting equipment details:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết thiết bị",
    });
  }
});

// Lấy thiết bị theo phòng
router.get("/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    const equipment = await Equipment.find({ room: roomId })
      .populate("lastReportedBy", "fullName")
      .sort({ equipmentCode: 1 });

    res.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    console.error("Error getting equipment by room:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thiết bị theo phòng",
    });
  }
});

// Thống kê thiết bị
router.get("/stats/overview", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const stats = await Equipment.aggregate([
      {
        $group: {
          _id: null,
          totalEquipment: { $sum: 1 },
          byStatus: {
            $push: "$status",
          },
          byCondition: {
            $push: "$condition",
          },
          byCategory: {
            $push: "$category",
          },
          totalValue: { $sum: "$purchasePrice" },
          needsMaintenance: {
            $sum: {
              $cond: [{ $in: ["$condition", ["fair", "poor"]] }, 1, 0],
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalEquipment: 0,
        byStatus: [],
        byCondition: [],
        byCategory: [],
        totalValue: 0,
        needsMaintenance: 0,
      },
    });
  } catch (error) {
    console.error("Error getting equipment stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê thiết bị",
    });
  }
});

export default router;
