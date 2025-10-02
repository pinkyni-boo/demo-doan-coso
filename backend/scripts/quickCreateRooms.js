import mongoose from "mongoose";
import Room from "../models/Room.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./backend/.env" });

const createSampleRooms = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Xóa dữ liệu cũ
    console.log("🗑️ Clearing existing rooms...");
    await Room.deleteMany({});

    // Tạo dữ liệu mẫu
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

    console.log("📝 Creating sample rooms...");
    const createdRooms = await Room.create(sampleRooms);

    console.log(`✅ Successfully created ${createdRooms.length} rooms:`);
    createdRooms.forEach((room) => {
      console.log(`   - ${room.roomName} (${room.roomCode})`);
    });
  } catch (error) {
    console.error("❌ Error creating sample rooms:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Chạy ngay khi import
createSampleRooms();
