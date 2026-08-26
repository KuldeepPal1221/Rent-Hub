import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect serverless environment (Vercel/AWS Lambda) and use /tmp,
// since the deployed code directory is read-only there.
const isServerless =
  process.env.VERCEL === '1' ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME;

const uploadDir = isServerless
  ? '/tmp/uploads'
  : path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    console.error('Could not create upload dir:', e.message);
  }
}

// Storage configuration with unique timestamp and sanitized filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images (JPEG, PNG, WEBP, GIF)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, GIF) are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB per file limit
  },
  fileFilter: fileFilter
});