const {
  uploadImage,
} = require("../services/storage.service");

// ==========================================
// UPLOAD MULTIPLE IMAGES
// ==========================================

const uploadMultipleImages = async (req, res) => {
  try {
    // Check files
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // Upload all images to ImageKit
    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadImage({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname}`,
        folder: "/timber-business",
      });

      uploadedImages.push(result);
    }

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: {
        images: uploadedImages.map((image) => image.url),
      },
    });

  } catch (error) {
    console.log("Multiple image upload error:", error);

    res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
};

module.exports = {
  uploadMultipleImages,
};