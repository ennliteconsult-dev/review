import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// --- PRODUCTION NOTE ---
// The default diskStorage is NOT suitable for production.
// In a real-world application, you would replace this with a package like 'multer-s3'
// to upload directly to a cloud storage provider (e.g., AWS S3).
// Example:
// import { S3Client } from '@aws-sdk/client-s3';
// import multerS3 from 'multer-s3';
//
// const s3 = new S3Client({ region: 'your-region' });
//
// const storage = multerS3({
//   s3: s3,
//   bucket: 'your-bucket-name',
//   metadata: function (req, file, cb) { ... },
//   key: function (req, file, cb) { ... }
// });
// --------------------

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwriting
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File filter to only accept images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.') as any, false);
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
});