// Test script for issue report functionality
import mongoose from "mongoose";
import NotificationService from "./services/NotificationService.js";

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/gym-management");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Test notification creation with issue_reported type
const testNotification = async () => {
  try {
    console.log("🧪 Testing notification creation...");

    const notification = await NotificationService.createNotification({
      title: "Test Issue Report",
      message: "Test message for issue report notification",
      type: "issue_reported",
      recipient: new mongoose.Types.ObjectId(), // Dummy recipient ID
      sender: new mongoose.Types.ObjectId(), // Dummy sender ID
      relatedId: new mongoose.Types.ObjectId(), // Dummy related ID
    });

    console.log("✅ Notification created successfully:", notification);

    // Clean up - remove the test notification
    await notification.deleteOne();
    console.log("🧹 Test notification cleaned up");
  } catch (error) {
    console.error("❌ Error testing notification:", error);
  }
};

// Run the tests
const runTests = async () => {
  await connectDB();
  await testNotification();

  console.log("✅ All tests completed!");
  process.exit(0);
};

runTests();
