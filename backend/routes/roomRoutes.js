import express from "express";
import Room from "../models/Room.js";
import Equipment from "../models/Equipment.js";
import {
  verifyToken,
  verifyAdmin,
  verifyAdminOrTrainer,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ============ ROOM MANAGEMENT ============

// Test endpoint
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Room routes are working!",
    timestamp: new Date().toISOString(),
  });
});

// Create sample rooms endpoint for debugging
router.post("/create-samples", async (req, res) => {
  try {
    console.log("Creating sample rooms...");

    // Xóa dữ liệu cũ
    await Room.deleteMany({});

    const sampleRooms = [
      {
        roomName: "Phòng Cardio 1",
        roomCode: "CARD-01",
        location: "Tầng 1, Khu A",
        capacity: 25,
        area: 80.5,
        status: "active",
        facilities: ["Điều hòa", "Gương lớn", "Hệ thống âm thanh", "Wifi"],
        description: "Phòng cardio chính với đầy đủ máy chạy bộ và xe đạp tập",
        currentCondition: "good",
      },
      {
        roomName: "Phòng Tập Tạ",
        roomCode: "WEIGHT-01",
        location: "Tầng 2, Khu A",
        capacity: 30,
        area: 120.0,
        status: "active",
        facilities: [
          "Điều hòa",
          "Gương toàn bộ tường",
          "Sàn cao su chuyên dụng",
        ],
        description: "Phòng tập tạ với đầy đủ thiết bị tự do và máy tập",
        currentCondition: "good",
      },
      {
        roomName: "Phòng Yoga",
        roomCode: "YOGA-01",
        location: "Tầng 3, Khu B",
        capacity: 20,
        area: 60.0,
        status: "active",
        facilities: ["Ánh sáng tự nhiên", "Sàn gỗ", "Gương", "Loa Bluetooth"],
        description: "Phòng tập yoga với không gian yên tĩnh",
        currentCondition: "excellent",
      },
    ];

    const createdRooms = await Room.create(sampleRooms);

    res.json({
      success: true,
      message: `Created ${createdRooms.length} sample rooms`,
      data: createdRooms,
    });
  } catch (error) {
    console.error("Error creating sample rooms:", error);
    res.status(500).json({
      success: false,
      message: "Error creating sample rooms",
      error: error.message,
    });
  }
});

// Lấy danh sách phòng tập
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/rooms called");
    const { status, condition } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (condition) filter.currentCondition = condition;

    const rooms = await Room.find(filter)
      .populate("lastInspectedBy", "fullName")
      .sort({ roomCode: 1 });

    console.log(`Found ${rooms.length} rooms`);

    res.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error("Error getting rooms:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phòng tập",
    });
  }
});

// Tạo phòng tập mới (Admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {
      roomName,
      roomCode,
      location,
      capacity,
      area,
      facilities,
      description,
    } = req.body;

    // Check if room code already exists
    const existingRoom = await Room.findOne({ roomCode });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Mã phòng đã tồn tại",
      });
    }

    const room = new Room({
      roomName,
      roomCode,
      location,
      capacity,
      area,
      facilities: facilities || [],
      description,
    });

    await room.save();

    res.status(201).json({
      success: true,
      message: "Đã tạo phòng tập thành công",
      data: room,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo phòng tập",
    });
  }
});

// Cập nhật thông tin phòng (Admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating roomCode, check for duplicates
    if (updateData.roomCode) {
      const existingRoom = await Room.findOne({
        roomCode: updateData.roomCode,
        _id: { $ne: id },
      });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: "Mã phòng đã tồn tại",
        });
      }
    }

    const room = await Room.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng tập",
      });
    }

    res.json({
      success: true,
      message: "Đã cập nhật phòng tập thành công",
      data: room,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật phòng tập",
    });
  }
});

// Báo cáo tình trạng phòng (Trainer có thể báo cáo)
router.post(
  "/:id/report",
  verifyToken,
  verifyAdminOrTrainer,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { condition, issues, description, priority } = req.body;

      const room = await Room.findById(id);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phòng tập",
        });
      }

      // Add report to history
      const reportData = {
        reportedBy: req.user._id,
        condition: condition || "good",
        issues: issues || [],
        description: description || "",
        priority: priority || "medium",
      };

      const updatedRoom = await Room.findByIdAndUpdate(
        id,
        {
          $push: { reportHistory: reportData },
          currentCondition: condition || room.currentCondition,
          lastInspectedBy: req.user._id,
          lastInspectedAt: new Date(),
        },
        { new: true }
      ).populate("lastInspectedBy", "fullName");

      res.json({
        success: true,
        message: "Đã báo cáo tình trạng phòng tập",
        data: updatedRoom,
      });
    } catch (error) {
      console.error("Error reporting room condition:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi báo cáo tình trạng phòng",
      });
    }
  }
);

// Xóa phòng (Admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if room has equipment
    const equipmentCount = await Equipment.countDocuments({ room: id });
    if (equipmentCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa phòng có thiết bị. Vui lòng chuyển thiết bị trước.",
      });
    }

    const room = await Room.findByIdAndDelete(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng tập",
      });
    }

    res.json({
      success: true,
      message: "Đã xóa phòng tập thành công",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa phòng tập",
    });
  }
});

// Lấy chi tiết phòng và lịch sử báo cáo
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id)
      .populate("lastInspectedBy", "fullName")
      .populate("reportHistory.reportedBy", "fullName");

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy phòng tập",
      });
    }

    // Get equipment in this room
    const equipment = await Equipment.find({ room: id }).select(
      "equipmentName equipmentCode status condition"
    );

    res.json({
      success: true,
      data: {
        room,
        equipment,
      },
    });
  } catch (error) {
    console.error("Error getting room details:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết phòng tập",
    });
  }
});

export default router;
