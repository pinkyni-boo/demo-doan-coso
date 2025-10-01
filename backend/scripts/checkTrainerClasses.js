import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Class from "../models/Class.js";

dotenv.config({ path: "../.env" });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkTrainerClasses() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Connected to MongoDB");
    
    // Lấy tất cả users có role là trainer
    const trainers = await User.find({ role: 'trainer' });
    console.log(`\n📋 Found ${trainers.length} trainers in database:`);
    
    for (const trainer of trainers) {
      console.log(`\n👨‍🏫 Trainer: ${trainer.fullName} (${trainer.email})`);
      
      // Tìm các lớp học được gán cho trainer này
      const assignedClasses = await Class.find({ 
        instructorName: trainer.fullName 
      });
      
      console.log(`   📚 Assigned classes: ${assignedClasses.length}`);
      
      if (assignedClasses.length > 0) {
        assignedClasses.forEach(cls => {
          console.log(`      - ${cls.className} (${cls.serviceName || 'No service'})`);
          console.log(`        Schedule: ${cls.schedule?.join(', ') || 'No schedule'}`);
          console.log(`        Status: ${cls.status || 'No status'}`);
        });
      } else {
        console.log(`      ❌ No classes assigned to ${trainer.fullName}`);
      }
    }
    
    // Kiểm tra tất cả lớp học có instructorName
    console.log(`\n📚 All classes with instructorName:`);
    const allClasses = await Class.find({ instructorName: { $exists: true, $ne: null } });
    
    console.log(`Found ${allClasses.length} classes with instructorName:`);
    allClasses.forEach(cls => {
      console.log(`  - ${cls.className}: instructor="${cls.instructorName}"`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
}

checkTrainerClasses();