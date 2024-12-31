const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình multer
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 8 // Tối đa 8 files
    }
}).array('images', 8);

const handleUpload = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json(formatResponse(false, null, `Upload error: ${err.message}`));
        } else if (err) {
            return res.status(500).json(formatResponse(false, null, `Server error: ${err.message}`));
        }
        next();
    });
};
module.exports = handleUpload