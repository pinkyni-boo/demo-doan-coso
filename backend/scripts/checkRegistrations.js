// backend/scripts/checkRegistrations.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import ClassRegistration from "../models/ClassRegistration.js";
import Schedule from "../models/Schedule.js";

dotenv.config({ path: "./backend/.env" });

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("❌ Vui lòng truyền userId khi chạy script:");
    console.error("   node scripts/checkRegistrations.js <userId>");
    process.exit(1);
  }

  try {
    // 1. Kết nối DB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🔎 Đang tìm đăng ký cho userId = ${userId}...\n`);

    // 2. Tìm registrations và populate schedule
    const regs = await ClassRegistration.find({ user: userId }).populate(
      "schedule"
    );

    if (regs.length === 0) {
      console.log("→ Không tìm thấy bản ghi đăng ký nào cho user này.");
    } else {
      console.log(`→ Tìm thấy ${regs.length} bản ghi:\n`);
      regs.forEach((reg, idx) => {
        console.log(`#${idx + 1}`);
        console.log(`  registration._id: ${reg._id}`);
        console.log(`  user           : ${reg.user.toString()}`);
        console.log(`  schedule._id   : ${reg.schedule._id}`);
        console.log(
          `  schedule.name  : ${reg.schedule.className || reg.schedule.name}`
        );
        console.log(
          `  schedule.date  : ${new Date(reg.schedule.date).toLocaleString()}`
        );
        console.log("---");
      });
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra registration:", err);
  } finally {
    mongoose.disconnect();
  }
}

main();
