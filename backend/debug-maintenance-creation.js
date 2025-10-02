import mongoose from "mongoose";
import IssueReport from "../models/IssueReport.js";
import MaintenanceSchedule from "../models/MaintenanceSchedule.js";
import User from "../models/User.js";

const debugMaintenanceCreation = async () => {
  try {
    // Connect to database
    await mongoose.connect("mongodb://localhost:27017/gym-management", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Find an existing issue report
    const issueReport = await IssueReport.findOne().populate("reportedBy");
    if (!issueReport) {
      console.log("❌ No issue reports found. Please create one first.");
      return;
    }

    console.log("📋 Found issue report:", {
      _id: issueReport._id,
      title: issueReport.title,
      reportType: issueReport.reportType,
      equipment: issueReport.equipment,
      room: issueReport.room,
      reportedBy: issueReport.reportedBy?.fullName,
    });

    // Find an admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("❌ No admin user found");
      return;
    }

    console.log("👤 Found admin user:", adminUser.fullName);

    // Test data that matches the frontend form
    const testMaintenanceData = {
      issueReport: issueReport._id,
      maintenanceType: "repair",
      targetType: issueReport.reportType,
      equipment: issueReport.equipment || undefined,
      room: issueReport.room || undefined,
      title: `Bảo trì: ${issueReport.title}`,
      description: issueReport.description,
      scheduledDate: new Date("2025-10-03T09:00:00.000Z"),
      estimatedDuration: 3,
      createdBy: adminUser._id,
      priority: "medium",
      estimatedCost: 500000,
      assignedTo: {
        technician: {
          name: "Test Technician",
          phone: "0901234567",
          email: "test@email.com",
          company: "Test Company",
        },
      },
    };

    console.log("🧪 Test maintenance data:", testMaintenanceData);

    // Try to create maintenance schedule
    const maintenanceSchedule = new MaintenanceSchedule(testMaintenanceData);

    console.log("🔍 Validating maintenance schedule...");
    await maintenanceSchedule.validate();
    console.log("✅ Validation passed");

    console.log("💾 Saving maintenance schedule...");
    await maintenanceSchedule.save();
    console.log(
      "✅ Maintenance schedule saved successfully:",
      maintenanceSchedule._id
    );

    // Clean up - remove the test maintenance
    await MaintenanceSchedule.findByIdAndDelete(maintenanceSchedule._id);
    console.log("🧹 Test maintenance cleaned up");
  } catch (error) {
    console.error("❌ Error:", error);
    console.error("📋 Error details:");
    console.error("  Name:", error.name);
    console.error("  Message:", error.message);
    if (error.name === "ValidationError") {
      console.error("  Validation errors:", error.errors);
    }
    console.error("  Stack:", error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
};

console.log("🔧 Starting maintenance creation debug...");
debugMaintenanceCreation();
