// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Ensure uploads directory exists
// const uploadDir = 'uploads/';
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Configure storage
// const storage = multer.diskStorage({ 
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); 
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   },
// });

// // File filter for images and videos
// const fileFilter = (req, file, cb) => {
//   const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
//   const allowedVideoTypes = ['video/mp4', 'video/mpeg'];
//   if (
//     (file.fieldname === 'images' && allowedImageTypes.includes(file.mimetype)) ||
//     (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype))
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${file.fieldname === 'images' ? 'JPEG, PNG, GIF' : 'MP4, MPEG'}`), false);
//   }
// };

// // Configure multer
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 20 * 1024 * 1024, // 10MB limit
//     files: 6, // Max 5 images + 1 video
//   },
// });

// module.exports = upload;


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({ 
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedVideoTypes = ['video/mp4', 'video/mpeg'];
  if (
    (file.fieldname === 'images' && allowedImageTypes.includes(file.mimetype)) ||
    (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype))
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${file.fieldname === 'images' ? 'JPEG, PNG, GIF' : 'MP4, MPEG'}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 10MB limit
    files: 6, // Max 5 images + 1 video
  },
});

module.exports = upload;