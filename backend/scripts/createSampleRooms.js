// Test script để tạo dữ liệu mẫu cho Room Management
import mongoose from "mongoose";
import Room from "../models/Room.js";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

const sampleRooms = [
  {
    roomName: "Phòng Cardio 1",
    roomCode: "CARD-01",
    location: "Tầng 1, Khu A",
    capacity: 25,
    area: 80.5,
    status: "active",
    facilities: [
      "Điều hòa",
      "Gương lớn",
      "Hệ thống âm thanh",
      "Wifi",
      "Nước uống miễn phí",
    ],
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
      "Hệ thống thông gió",
    ],
    description: "Phòng tập tạ với đầy đủ thiết bị tự do và máy tập",
    currentCondition: "good",
  },
  {
    roomName: "Phòng Yoga & Pilates",
    roomCode: "YOGA-01",
    location: "Tầng 3, Khu B",
    capacity: 20,
    area: 60.0,
    status: "active",
    facilities: [
      "Ánh sáng tự nhiên",
      "Sàn gỗ",
      "Gương",
      "Loa Bluetooth",
      "Kệ đựng đồ",
    ],
    description: "Phòng tập yoga và pilates với không gian yên tĩnh",
    currentCondition: "excellent",
  },
  {
    roomName: "Phòng Functional Training",
    roomCode: "FUNC-01",
    location: "Tầng 1, Khu B",
    capacity: 15,
    area: 50.0,
    status: "active",
    facilities: [
      "TRX",
      "Kettlebell",
      "Battle rope",
      "Medicine ball",
      "Plyometric boxes",
    ],
    description: "Phòng tập functional training với thiết bị đa dạng",
    currentCondition: "good",
  },
  {
    roomName: "Phòng Cardio 2",
    roomCode: "CARD-02",
    location: "Tầng 2, Khu B",
    capacity: 20,
    area: 70.0,
    status: "maintenance",
    facilities: ["Điều hòa", "Gương", "TV LCD", "Wifi"],
    description: "Phòng cardio phụ, hiện đang bảo trì hệ thống điều hòa",
    currentCondition: "needs_repair",
  },
  {
    roomName: "Phòng Group Class",
    roomCode: "GROUP-01",
    location: "Tầng 3, Khu A",
    capacity: 35,
    area: 100.0,
    status: "active",
    facilities: [
      "Sàn nhún",
      "Hệ thống âm thanh chuyên nghiệp",
      "Máy chiếu",
      "Điều hòa mạnh",
    ],
    description: "Phòng lớp học nhóm với sức chứa lớn",
    currentCondition: "good",
  },
];

async function createSampleRooms() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Xóa dữ liệu cũ
    console.log("🗑️ Clearing existing room data...");
    await Room.deleteMany({});

    // Tạo dữ liệu mẫu
    console.log("📝 Creating sample rooms...");
    const createdRooms = await Room.insertMany(sampleRooms);

    console.log(`✅ Successfully created ${createdRooms.length} sample rooms:`);
    createdRooms.forEach((room) => {
      console.log(`   - ${room.roomName} (${room.roomCode}) - ${room.status}`);
    });

    console.log("\n📊 Room Statistics:");
    const stats = {
      total: await Room.countDocuments(),
      active: await Room.countDocuments({ status: "active" }),
      maintenance: await Room.countDocuments({ status: "maintenance" }),
      inactive: await Room.countDocuments({ status: "inactive" }),
    };

    console.log(`   Total: ${stats.total}`);
    console.log(`   Active: ${stats.active}`);
    console.log(`   Maintenance: ${stats.maintenance}`);
    console.log(`   Inactive: ${stats.inactive}`);
  } catch (error) {
    console.error("❌ Error creating sample data:", error);
  } finally {
    console.log("🔌 Disconnecting from MongoDB...");
    await mongoose.disconnect();
    console.log("✅ Disconnected");
    process.exit(0);
  }
}

// Chạy script
createSampleRooms();
