import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Trainer from "../models/Trainer.js";
import Service from "../models/Service.js";

dotenv.config({ path: "./backend/.env" });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkAndCreateAdminAndTrainers() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // 1. Kiểm tra admin users
    console.log("\n=== CHECKING ADMIN USERS ===");
    const adminUsers = await User.find({ role: "admin" });
    console.log(`📋 Found ${adminUsers.length} admin users`);

    if (adminUsers.length === 0) {
      console.log("⚠️ No admin users found. Creating default admin...");
      const defaultAdmin = new User({
        username: "admin",
        email: "admin@fitness.com",
        fullName: "System Administrator",
        password: "admin123", // Will be hashed by model
        role: "admin",
        phone: "0900000000",
        address: "Fitness Center",
        dob: new Date("1990-01-01"),
        gender: "male",
      });

      await defaultAdmin.save();
      console.log(
        "✅ Created default admin user: admin@fitness.com / admin123"
      );
    } else {
      console.log("Admin users:");
      adminUsers.forEach((admin) => {
        console.log(`  - ${admin.fullName} (${admin.email})`);
      });
    }

    // 2. Kiểm tra services (cần để tạo trainers)
    console.log("\n=== CHECKING SERVICES ===");
    const services = await Service.find();
    console.log(`📋 Found ${services.length} services`);

    if (services.length === 0) {
      console.log("⚠️ No services found. Creating sample services...");
      const sampleServices = [
        {
          serviceName: "Yoga",
          description: "Yoga cơ bản và nâng cao",
          price: 300000,
          duration: 60,
          maxParticipants: 15,
        },
        {
          serviceName: "Gym",
          description: "Tập gym cơ bản và nâng cao",
          price: 500000,
          duration: 90,
          maxParticipants: 20,
        },
        {
          serviceName: "Boxing",
          description: "Boxing và võ thuật",
          price: 400000,
          duration: 75,
          maxParticipants: 12,
        },
      ];

      for (const serviceData of sampleServices) {
        const service = new Service(serviceData);
        await service.save();
        console.log(`✅ Created service: ${service.serviceName}`);
      }
    } else {
      console.log("Services:");
      services.forEach((service) => {
        console.log(`  - ${service.serviceName} (${service.price}đ)`);
      });
    }

    // 3. Kiểm tra trainers
    console.log("\n=== CHECKING TRAINERS ===");
    const trainers = await Trainer.find().populate("specialty", "serviceName");
    console.log(`📋 Found ${trainers.length} trainers`);

    if (trainers.length === 0) {
      console.log("⚠️ No trainers found. Creating sample trainers...");

      // Get services để gán cho trainers
      const allServices = await Service.find();

      if (allServices.length === 0) {
        console.log("❌ Cannot create trainers: No services available");
        return;
      }

      const sampleTrainers = [
        {
          fullName: "Nguyễn Văn Trainer",
          email: "trainer1@gym.com",
          phone: "0901234567",
          gender: "male",
          specialty: allServices[0]._id,
          experience: 3,
          status: "active",
        },
        {
          fullName: "Trần Thị Hương",
          email: "trainer2@gym.com",
          phone: "0902345678",
          gender: "female",
          specialty: allServices[1] ? allServices[1]._id : allServices[0]._id,
          experience: 5,
          status: "active",
        },
        {
          fullName: "Lê Minh Anh",
          email: "trainer3@gym.com",
          phone: "0903456789",
          gender: "male",
          specialty: allServices[2] ? allServices[2]._id : allServices[0]._id,
          experience: 2,
          status: "active",
        },
      ];

      for (const trainerData of sampleTrainers) {
        const trainer = new Trainer(trainerData);
        await trainer.save();
        console.log(`✅ Created trainer: ${trainer.fullName}`);
      }
    } else {
      console.log("Trainers:");
      trainers.forEach((trainer) => {
        console.log(`  - ${trainer.fullName} (${trainer.email})`);
        console.log(
          `    Status: ${trainer.status}, Specialty: ${
            trainer.specialty?.serviceName || "N/A"
          }, Experience: ${trainer.experience} years`
        );
      });
    }

    // 4. Summary
    console.log("\n=== SUMMARY ===");
    const finalAdminCount = await User.countDocuments({ role: "admin" });
    const finalServiceCount = await Service.countDocuments();
    const finalTrainerCount = await Trainer.countDocuments();

    console.log(`📊 Admin users: ${finalAdminCount}`);
    console.log(`📊 Services: ${finalServiceCount}`);
    console.log(`📊 Trainers: ${finalTrainerCount}`);

    if (finalAdminCount > 0 && finalTrainerCount > 0) {
      console.log("\n🎉 Setup complete! You can now:");
      console.log(
        "1. Login to admin dashboard with: admin@fitness.com / admin123"
      );
      console.log("2. View trainer list in admin dashboard");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
}

checkAndCreateAdminAndTrainers();
