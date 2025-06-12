import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with your actual credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "di0wu5kyl",
  api_key: process.env.CLOUDINARY_API_KEY || "957483758987246",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "iiVeKkwHqHmbScrWTqmYRWxT5M4",
});

// Create storage engine for Multer with public access
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto:good" },
    ],
    // Ensure images are publicly accessible
    resource_type: "auto",
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      return `user-avatar-${uniqueSuffix}`;
    },
  },
});

// Configure Multer with the storage engine
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export { cloudinary, upload };
