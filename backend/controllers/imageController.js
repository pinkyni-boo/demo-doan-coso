import User from "../models/User.js";
import { cloudinary } from "../config/cloudinary.js";

// Upload avatar for a user
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const userId = req.params.userId;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Upload file details:", req.file);

    // Get the uploaded image URL - check all possible properties
    const imageUrl = req.file.path || req.file.secure_url || req.file.url;
    const publicId = req.file.filename || req.file.public_id;

    if (!imageUrl) {
      console.error("Error: No URL found in file object", req.file);
      return res
        .status(500)
        .json({ message: "No URL found in upload response" });
    }

    // Create avatar object
    const avatarData = {
      public_id: publicId,
      url: imageUrl,
    };

    console.log("Avatar data to save:", avatarData);

    // If the user already has an avatar, delete the old one
    if (user.avatar && user.avatar.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
      }
    }

    // Update user avatar in database
    user.avatar = avatarData;
    await user.save();

    console.log("User updated with avatar:", user);

    // Return success response
    return res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: avatarData,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return res.status(500).json({ message: "Server error uploading avatar" });
  }
};

// Get all images (admin only)
export const getAllImages = async (req, res) => {
  try {
    // Get images from Cloudinary
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 100,
    });

    return res.status(200).json({
      images: result.resources.map((img) => ({
        public_id: img.public_id,
        url: img.secure_url,
        format: img.format,
        bytes: img.bytes,
        created_at: img.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ message: "Server error fetching images" });
  }
};

// Delete image by public_id (admin only)
export const deleteImage = async (req, res) => {
  try {
    const public_id = req.params.public_id;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // If this is an avatar, also update the user
    const user = await User.findOne({ "avatar.public_id": public_id });
    if (user) {
      user.avatar = null;
      await user.save();
    }

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ message: "Server error deleting image" });
  }
};

// Upload general image (admin only)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Get the uploaded image details
    const image = {
      public_id: req.file.filename || req.file.public_id,
      url: req.file.path || req.file.secure_url || req.file.url,
    };

    return res.status(200).json({
      message: "Image uploaded successfully",
      image,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({ message: "Server error uploading image" });
  }
};
