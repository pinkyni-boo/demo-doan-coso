import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import route files
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js"; // New import
import imageRoutes from "./routes/imageRoutes.js"; // New import
import classRoutes from "./routes/classRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import statsRoutes from "./routes/statsRoutes.js"; // New import

// Load environment variables
dotenv.config({ path: "./backend/.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/stats", statsRoutes); // New route

// MongoDB URI and PORT
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGO_URI is missing in .env file.");
  process.exit(1);
}

// Database connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
