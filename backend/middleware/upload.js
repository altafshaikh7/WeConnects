const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "linkedin-clone";
    let publicId = `file_${Date.now()}`;
    let transformation = [{ width: 500, height: 500, crop: "limit" }];

    // 🔥 DIFFERENT HANDLING
    if (file.fieldname === "profileImage") {
      folder = "linkedin-clone/profile";
      publicId = `profile_${Date.now()}`;
      transformation = [{ width: 300, height: 300, crop: "fill" }];
    }

    if (file.fieldname === "bannerImage") {
      folder = "linkedin-clone/banner";
      publicId = `banner_${Date.now()}`;
      transformation = [{ width: 1200, height: 300, crop: "limit" }];
    }

    return {
      folder,
      resource_type: "image",
      public_id: publicId,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },

  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed ❌"), false);
    }
  },
});

module.exports = upload;