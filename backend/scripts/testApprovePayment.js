import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import ClassEnrollment from "../models/ClassEnrollment.js";
import User from "../models/User.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./backend/.env" });

async function testApprovePayment() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find a pending payment
    const payment = await Payment.findOne({ status: "pending" }).populate(
      "user"
    );

    if (!payment) {
      console.log("No pending payments found");
      return;
    }

    console.log("Found payment:", {
      id: payment._id,
      amount: payment.amount,
      user: payment.user?.fullName || payment.user?.username,
      registrationIds: payment.registrationIds,
      status: payment.status,
    });

    // Check registrationIds
    for (const regId of payment.registrationIds) {
      console.log(`Checking registration ID: ${regId}`);

      const enrollment = await ClassEnrollment.findById(regId);
      if (enrollment) {
        console.log(
          `Found ClassEnrollment: ${regId}, paymentStatus: ${enrollment.paymentStatus}`
        );
      } else {
        console.log(`ClassEnrollment not found: ${regId}`);
      }
    }

    // Test the approve logic manually
    console.log("\n--- Testing approve logic ---");

    payment.status = "approved";
    payment.completedAt = new Date();
    payment.approvedBy = "test-admin";

    await payment.save();
    console.log("Payment status updated successfully");

    // Update enrollments
    for (const regId of payment.registrationIds) {
      const enrollment = await ClassEnrollment.findById(regId);
      if (enrollment) {
        enrollment.paymentStatus = true;
        await enrollment.save();
        console.log(`Updated enrollment ${regId} paymentStatus to true`);
      }
    }

    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

testApprovePayment();
