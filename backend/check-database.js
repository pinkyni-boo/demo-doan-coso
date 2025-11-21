import mongoose from "mongoose";
import dotenv from "dotenv";
import Class from "./models/Class.js";

dotenv.config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Tìm tất cả classes
    const classes = await Class.find({
      status: { $in: ["upcoming", "ongoing"] },
    }).limit(5);

    console.log(`Found ${classes.length} active classes:\n`);

    classes.forEach((cls, index) => {
      console.log(`${index + 1}. ${cls.className}`);
      console.log(`   Instructor: ${cls.instructorName}`);
      console.log(`   Status: ${cls.status}`);
      console.log(`   Date range: ${cls.startDate} to ${cls.endDate}`);
      console.log(`   Schedule:`, JSON.stringify(cls.schedule, null, 2));
      console.log("");
    });

    await mongoose.connection.close();
    console.log("✅ Done");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkDatabase();
