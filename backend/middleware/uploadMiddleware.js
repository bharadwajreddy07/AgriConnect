import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
        );
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedVideoTypes = /mp4|avi|mov|wmv/;
    const allowedDocTypes = /pdf|doc|docx/;

    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (file.fieldname === 'images') {
        const isValidImage =
            allowedImageTypes.test(extname) && mimetype.startsWith('image/');
        if (isValidImage) {
            return cb(null, true);
        }
    } else if (file.fieldname === 'videos') {
        const isValidVideo =
            allowedVideoTypes.test(extname) && mimetype.startsWith('video/');
        if (isValidVideo) {
            return cb(null, true);
        }
    } else if (file.fieldname === 'documents') {
        const isValidDoc = allowedDocTypes.test(extname);
        if (isValidDoc) {
            return cb(null, true);
        }
    } else {
        // For profile images and other single files
        const isValidFile =
            allowedImageTypes.test(extname) && mimetype.startsWith('image/');
        if (isValidFile) {
            return cb(null, true);
        }
    }

    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    },
    fileFilter: fileFilter,
});

// Export different upload configurations
export const uploadCropMedia = upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 },
]);

export const uploadProfileImage = upload.single('profileImage');

export const uploadDocuments = upload.array('documents', 5);

export default upload;
