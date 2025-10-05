// Script để thêm schedule cho các classes hiện có
import mongoose from "mongoose";
import Class from "../models/Class.js";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

const sampleSchedules = [
  [
    { dayOfWeek: 1, startTime: "06:00", endTime: "07:00" }, // Thứ 2
    { dayOfWeek: 3, startTime: "06:00", endTime: "07:00" }, // Thứ 4
    { dayOfWeek: 5, startTime: "06:00", endTime: "07:00" }, // Thứ 6
  ],
  [
    { dayOfWeek: 2, startTime: "18:00", endTime: "19:30" }, // Thứ 3
    { dayOfWeek: 4, startTime: "18:00", endTime: "19:30" }, // Thứ 5
  ],
  [
    { dayOfWeek: 1, startTime: "19:00", endTime: "20:30" }, // Thứ 2
    { dayOfWeek: 3, startTime: "19:00", endTime: "20:30" }, // Thứ 4
  ],
  [
    { dayOfWeek: 2, startTime: "07:00", endTime: "08:30" }, // Thứ 3
    { dayOfWeek: 4, startTime: "07:00", endTime: "08:30" }, // Thứ 5
    { dayOfWeek: 6, startTime: "07:00", endTime: "08:30" }, // Thứ 7
  ],
  [
    { dayOfWeek: 0, startTime: "09:00", endTime: "10:30" }, // Chủ nhật
  ],
  [
    { dayOfWeek: 1, startTime: "17:00", endTime: "18:00" }, // Thứ 2
    { dayOfWeek: 3, startTime: "17:00", endTime: "18:00" }, // Thứ 4
    { dayOfWeek: 5, startTime: "17:00", endTime: "18:00" }, // Thứ 6
  ],
];

async function addScheduleToClasses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔗 Connected to MongoDB");

    // Lấy tất cả classes không có schedule hoặc có schedule rỗng
    const classes = await Class.find({
      $or: [
        { schedule: { $exists: false } },
        { schedule: { $size: 0 } },
        { schedule: null }
      ]
    });

    console.log(`📚 Found ${classes.length} classes without schedule`);

    for (let i = 0; i < classes.length; i++) {
      const classItem = classes[i];
      const scheduleIndex = i % sampleSchedules.length;
      const schedule = sampleSchedules[scheduleIndex];

      await Class.findByIdAndUpdate(classItem._id, {
        schedule: schedule
      });

      console.log(`✅ Added schedule to "${classItem.className}":`, schedule);
    }

    console.log("🎉 Successfully added schedules to all classes!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Chạy script
addScheduleToClasses();