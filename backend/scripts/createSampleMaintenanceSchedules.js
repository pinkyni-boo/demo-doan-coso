import mongoose from "mongoose";
import MaintenanceSchedule from "../models/MaintenanceSchedule.js";
import Equipment from "../models/Equipment.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

const createSampleMaintenanceSchedules = async () => {
  try {
    // Kết nối database
    await mongoose.connect("mongodb://localhost:27017/gym-management", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Lấy một admin user để làm createdBy
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("Không tìm thấy admin user. Vui lòng tạo admin user trước.");
      return;
    }

    // Lấy một vài phòng và thiết bị
    const rooms = await Room.find().limit(3);
    const equipment = await Equipment.find().limit(3);

    if (rooms.length === 0) {
      console.log("Không tìm thấy phòng nào. Vui lòng tạo phòng trước.");
      return;
    }

    // Xóa lịch bảo trì cũ
    await MaintenanceSchedule.deleteMany({});

    // Tạo ngày cho tuần này và tuần tới
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());

    const sampleSchedules = [
      // Tuần này
      {
        title: "Bảo trì định kỳ hệ thống điều hòa",
        description:
          "Kiểm tra và bảo trì hệ thống điều hòa không khí trong phòng tập",
        maintenanceType: "routine",
        targetType: "room",
        room: rooms[0]._id,
        scheduledDate: new Date(
          currentWeekStart.getTime() + 1 * 24 * 60 * 60 * 1000
        ), // Thứ 2
        estimatedDuration: 2,
        priority: "medium",
        status: "scheduled",
        createdBy: adminUser._id,
        estimatedCost: 500000,
        assignedTo: {
          technician: {
            name: "Nguyễn Văn Hùng",
            phone: "0901234567",
            email: "hung.technician@gmail.com",
            company: "Công ty TNHH Bảo trì ABC",
          },
        },
      },
      {
        title: "Sửa chữa máy chạy bộ",
        description: "Thay thế băng tải máy chạy bộ bị hỏng",
        maintenanceType: "repair",
        targetType: "equipment",
        equipment: equipment.length > 0 ? equipment[0]._id : null,
        room: rooms[0]._id,
        scheduledDate: new Date(
          currentWeekStart.getTime() + 3 * 24 * 60 * 60 * 1000
        ), // Thứ 4
        estimatedDuration: 3,
        priority: "high",
        status: "scheduled",
        createdBy: adminUser._id,
        estimatedCost: 2000000,
        assignedTo: {
          technician: {
            name: "Trần Quốc Việt",
            phone: "0912345678",
            email: "viet.repair@gmail.com",
            company: "Trung tâm sửa chữa XYZ",
          },
        },
      },
      {
        title: "Kiểm tra an toàn thiết bị",
        description:
          "Kiểm tra định kỳ an toàn cho tất cả thiết bị trong phòng tập",
        maintenanceType: "inspection",
        targetType: "room",
        room: rooms[1]._id,
        scheduledDate: new Date(
          currentWeekStart.getTime() + 5 * 24 * 60 * 60 * 1000
        ), // Thứ 6
        estimatedDuration: 4,
        priority: "medium",
        status: "scheduled",
        createdBy: adminUser._id,
        estimatedCost: 800000,
        assignedTo: {
          technician: {
            name: "Lê Thị Mai",
            phone: "0923456789",
            email: "mai.inspector@gmail.com",
            company: "Công ty Kiểm định DEF",
          },
        },
      },
      // Tuần tới
      {
        title: "Bảo trì khẩn cấp hệ thống điện",
        description: "Sửa chữa sự cố mất điện đột xuất tại phòng tập",
        maintenanceType: "emergency",
        targetType: "room",
        room: rooms[2]._id,
        scheduledDate: new Date(
          currentWeekStart.getTime() + 8 * 24 * 60 * 60 * 1000
        ), // Thứ 2 tuần sau
        estimatedDuration: 6,
        priority: "urgent",
        status: "scheduled",
        createdBy: adminUser._id,
        estimatedCost: 3000000,
        assignedTo: {
          technician: {
            name: "Phạm Văn Đức",
            phone: "0934567890",
            email: "duc.electrical@gmail.com",
            company: "Công ty Điện lực GHI",
          },
        },
      },
      {
        title: "Thay thế thiết bị cũ",
        description: "Thay thế các thiết bị tập gym đã hết hạn sử dụng",
        maintenanceType: "replacement",
        targetType: "equipment",
        equipment: equipment.length > 1 ? equipment[1]._id : null,
        room: rooms[1]._id,
        scheduledDate: new Date(
          currentWeekStart.getTime() + 10 * 24 * 60 * 60 * 1000
        ), // Thứ 4 tuần sau
        estimatedDuration: 8,
        priority: "high",
        status: "scheduled",
        createdBy: adminUser._id,
        estimatedCost: 15000000,
        assignedTo: {
          technician: {
            name: "Võ Minh Tâm",
            phone: "0945678901",
            email: "tam.equipment@gmail.com",
            company: "Nhà cung cấp thiết bị JKL",
          },
        },
      },
    ];

    // Lọc bỏ những schedule không có equipment nếu cần
    const validSchedules = sampleSchedules.filter((schedule) => {
      if (schedule.targetType === "equipment" && !schedule.equipment) {
        return false;
      }
      return true;
    });

    // Tạo lịch bảo trì
    const createdSchedules = await MaintenanceSchedule.insertMany(
      validSchedules
    );

    console.log(`✅ Đã tạo ${createdSchedules.length} lịch bảo trì mẫu:`);
    createdSchedules.forEach((schedule, index) => {
      console.log(
        `${index + 1}. ${
          schedule.title
        } - ${schedule.scheduledDate.toLocaleDateString("vi-VN")} - ${
          schedule.priority
        }`
      );
    });
  } catch (error) {
    console.error("❌ Lỗi khi tạo lịch bảo trì mẫu:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Đã ngắt kết nối database");
  }
};

// Chạy script
createSampleMaintenanceSchedules();
