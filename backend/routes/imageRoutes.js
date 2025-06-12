import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Cấu hình Cloudinary
const ensureCloudinaryConfig = () => {
  const config = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  cloudinary.config(config);
  return config;
};

// Cấu hình Cloudinary ban đầu
ensureCloudinaryConfig();

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được upload file ảnh!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Upload single image to Cloudinary
router.post(
  "/upload",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const config = ensureCloudinaryConfig();

      if (!config.cloud_name) {
        return res.status(500).json({
          message: "Cloudinary chưa được cấu hình",
          error: "Missing CLOUDINARY_CLOUD_NAME",
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Không có file được upload" });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "gym-images",
              transformation: [
                { width: 1200, height: 800, crop: "limit" },
                { quality: "auto", fetch_format: "auto" },
              ],
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });

      res.json({
        message: "Upload ảnh thành công",
        imageUrl: result.secure_url,
        publicId: result.public_id,
        filename: result.original_filename || `image-${Date.now()}`,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      res.status(500).json({
        message: "Lỗi khi upload ảnh",
        error: error.message,
      });
    }
  }
);

// Upload multiple images to Cloudinary
router.post(
  "/upload-multiple",
  verifyToken,
  upload.array("images", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Không có file được upload" });
      }

      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "image",
                folder: "gym-images",
                transformation: [
                  { width: 800, height: 600, crop: "limit" },
                  { quality: "auto", fetch_format: "auto" },
                ],
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            )
            .end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      const imageData = results.map((result) => ({
        imageUrl: result.secure_url,
        publicId: result.public_id,
        filename: result.original_filename || `image-${Date.now()}`,
        size: result.bytes,
        format: result.format,
        width: result.width,
        height: result.height,
      }));

      res.json({
        message: "Upload ảnh thành công",
        images: imageData,
      });
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      res.status(500).json({
        message: "Lỗi khi upload ảnh",
        error: error.message,
      });
    }
  }
);

// Get all images from Cloudinary (admin only)
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const config = ensureCloudinaryConfig();

    if (!config.cloud_name) {
      return res.status(500).json({
        message: "Cloudinary chưa được cấu hình",
        error: "Missing CLOUDINARY_CLOUD_NAME",
      });
    }

    const { max_results = 20, next_cursor } = req.query;

    const options = {
      resource_type: "image",
      max_results: parseInt(max_results),
      type: "upload",
    };

    if (next_cursor) {
      options.next_cursor = next_cursor;
    }

    const result = await cloudinary.api.resources(options);

    // Filter gym-images sau khi lấy về
    const filteredResources = result.resources.filter(
      (resource) =>
        resource.public_id.startsWith("gym-images/") ||
        resource.folder === "gym-images" ||
        !resource.folder // Include images without folder
    );

    const images = filteredResources.map((resource) => ({
      publicId: resource.public_id,
      filename: resource.filename || resource.public_id.split("/").pop(),
      url: resource.secure_url,
      size: resource.bytes,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      uploadDate: resource.created_at,
      tags: resource.tags || [],
    }));

    res.json({
      images,
      total_count: filteredResources.length,
      next_cursor: result.next_cursor,
    });
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);

    // Fallback method
    try {
      const fallbackResult = await cloudinary.api.resources({
        resource_type: "image",
        max_results: 10,
      });

      const images = fallbackResult.resources.map((resource) => ({
        publicId: resource.public_id,
        filename: resource.filename || resource.public_id.split("/").pop(),
        url: resource.secure_url,
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        format: resource.format,
        uploadDate: resource.created_at,
        tags: resource.tags || [],
      }));

      res.json({
        images,
        total_count: images.length,
        next_cursor: fallbackResult.next_cursor,
      });
    } catch (fallbackError) {
      const errorMessage =
        error?.message || error?.toString() || "Unknown error";

      res.status(500).json({
        message: "Lỗi khi lấy danh sách ảnh",
        error: errorMessage,
      });
    }
  }
});

// Delete image from Cloudinary (admin only)
router.delete("/:publicId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    ensureCloudinaryConfig();

    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === "ok") {
      res.json({
        message: "Xóa ảnh thành công",
        publicId: decodedPublicId,
      });
    } else {
      res.status(404).json({
        message: "Không tìm thấy ảnh hoặc đã bị xóa",
        result: result,
      });
    }
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    res.status(500).json({
      message: "Lỗi khi xóa ảnh",
      error: error.message,
    });
  }
});

// Get image details by publicId
router.get("/:publicId/details", verifyToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.api.resource(decodedPublicId, {
      image_metadata: true,
    });

    res.json({
      publicId: result.public_id,
      filename: result.filename || result.public_id.split("/").pop(),
      url: result.secure_url,
      size: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format,
      uploadDate: result.created_at,
      tags: result.tags || [],
      metadata: result.image_metadata || {},
    });
  } catch (error) {
    console.error("Error getting image details:", error);
    res.status(500).json({
      message: "Lỗi khi lấy thông tin ảnh",
      error: error.message,
    });
  }
});

// Add tags to image
router.put("/:publicId/tags", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { tags } = req.body;
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.add_tag(tags, [decodedPublicId]);

    res.json({
      message: "Thêm tags thành công",
      publicIds: result.public_ids,
    });
  } catch (error) {
    console.error("Error adding tags:", error);
    res.status(500).json({
      message: "Lỗi khi thêm tags",
      error: error.message,
    });
  }
});

export default router;
