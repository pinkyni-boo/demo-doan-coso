import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/gym-management");

async function testTrainers() {
  try {
    console.log("=== CHECKING TRAINERS IN DATABASE ===");

    // Check for trainers
    const trainers = await User.find({ role: "trainer" }).select(
      "username fullName email role"
    );
    console.log("Found trainers:", trainers);
    console.log("Number of trainers:", trainers.length);

    if (trainers.length === 0) {
      console.log("\n=== NO TRAINERS FOUND - CREATING TEST TRAINERS ===");

      // Hash password
      const hashedPassword = await bcrypt.hash("123456789", 10);

      const testTrainers = [
        {
          username: "trainer_john",
          fullName: "John Smith",
          email: "john@trainer.com",
          password: hashedPassword,
          role: "trainer",
          phone: "0123456789",
          dateOfBirth: new Date("1990-01-01"),
          gender: "male",
          address: "123 Trainer Street",
        },
        {
          username: "trainer_mary",
          fullName: "Mary Johnson",
          email: "mary@trainer.com",
          password: hashedPassword,
          role: "trainer",
          phone: "0987654321",
          dateOfBirth: new Date("1992-05-15"),
          gender: "female",
          address: "456 Fitness Avenue",
        },
        {
          username: "trainer_david",
          fullName: "David Wilson",
          email: "david@trainer.com",
          password: hashedPassword,
          role: "trainer",
          phone: "0555123456",
          dateOfBirth: new Date("1988-10-20"),
          gender: "male",
          address: "789 Gym Boulevard",
        },
      ];

      for (let i = 0; i < testTrainers.length; i++) {
        try {
          const trainer = new User(testTrainers[i]);
          await trainer.save();
          console.log(
            `✅ Created trainer: ${trainer.fullName} (${trainer.username})`
          );
        } catch (error) {
          console.log(
            `❌ Error creating trainer ${testTrainers[i].username}:`,
            error.message
          );
        }
      }
    } else {
      console.log("\n=== TRAINERS ALREADY EXIST ===");
      trainers.forEach((trainer, index) => {
        console.log(
          `${index + 1}. ${trainer.fullName} (${trainer.username}) - ${
            trainer.email
          }`
        );
      });
    }

    // Test API endpoint manually
    console.log("\n=== TESTING TRAINER QUERY ===");
    const trainersForAPI = await User.find({ role: "trainer" }).select(
      "username fullName email avatar"
    );
    console.log("Trainers for API:", trainersForAPI);

    mongoose.disconnect();
    console.log("\n=== DONE ===");
  } catch (error) {
    console.error("Error:", error);
    mongoose.disconnect();
  }
}

testTrainers();
