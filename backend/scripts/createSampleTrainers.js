import mongoose from "mongoose";
import dotenv from "dotenv";
import Trainer from "../models/Trainer.js";
import Service from "../models/Service.js";

dotenv.config({ path: "./backend/.env" });

const MONGODB_URI = process.env.MONGODB_URI;

async function createSampleTrainers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Kiểm tra xem có trainers nào trong database không
    const existingTrainers = await Trainer.find();
    console.log(`📋 Found ${existingTrainers.length} existing trainers`);

    if (existingTrainers.length > 0) {
      console.log("Existing trainers:");
      existingTrainers.forEach((trainer) => {
        console.log(
          `  - ${trainer.fullName} (${trainer.email}) - ${trainer.status}`
        );
      });
    }

    // Lấy một service để làm specialty
    const services = await Service.find();
    console.log(`📋 Found ${services.length} services`);

    if (services.length === 0) {
      console.log("⚠️ No services found. Creating a sample service...");
      const sampleService = new Service({
        serviceName: "Yoga",
        description: "Yoga cơ bản và nâng cao",
        price: 300000,
        duration: 60,
        maxParticipants: 15,
      });
      await sampleService.save();
      services.push(sampleService);
      console.log("✅ Created sample service: Yoga");
    }

    // Nếu chưa có trainer nào, tạo trainer mẫu
    if (existingTrainers.length === 0) {
      const sampleTrainers = [
        {
          fullName: "Nguyễn Văn Trainer",
          email: "trainer1@gym.com",
          phone: "0901234567",
          gender: "male",
          specialty: services[0]._id,
          experience: 3,
          status: "active",
        },
        {
          fullName: "Trần Thị Hương",
          email: "trainer2@gym.com",
          phone: "0902345678",
          gender: "female",
          specialty: services[0]._id,
          experience: 5,
          status: "active",
        },
        {
          fullName: "Lê Minh Anh",
          email: "trainer3@gym.com",
          phone: "0903456789",
          gender: "male",
          specialty: services[0]._id,
          experience: 2,
          status: "inactive",
        },
      ];

      for (const trainerData of sampleTrainers) {
        const trainer = new Trainer(trainerData);
        await trainer.save();
        console.log(`✅ Created trainer: ${trainer.fullName}`);
      }

      console.log("🎉 Successfully created sample trainers!");
    } else {
      console.log("ℹ️ Trainers already exist, skipping creation");
    }

    // Hiển thị tất cả trainers sau khi tạo
    const allTrainers = await Trainer.find().populate("specialty", "name");
    console.log(`\n📋 Total trainers in database: ${allTrainers.length}`);
    allTrainers.forEach((trainer) => {
      console.log(`  - ${trainer.fullName} (${trainer.email})`);
      console.log(
        `    Status: ${trainer.status}, Specialty: ${
          trainer.specialty?.name || "N/A"
        }, Experience: ${trainer.experience} years`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

createSampleTrainers();
