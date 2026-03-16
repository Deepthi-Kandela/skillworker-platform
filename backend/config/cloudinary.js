const multer = require('multer');

// Use memory storage as fallback when Cloudinary is not configured
const storage = multer.memoryStorage();
const upload = multer({ storage });

let cloudinary = null;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
) {
  const cloudinaryLib = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinaryLib.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  cloudinary = cloudinaryLib;
}

module.exports = { cloudinary, upload };
