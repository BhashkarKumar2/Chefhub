import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary only if environment variables are present
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured successfully');
} else {
  console.log('⚠️ Cloudinary not configured - missing environment variables');
  console.log('💡 Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env file');
}

// Test Cloudinary configuration on startup
const testConnection = async () => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      await cloudinary.api.ping();
      console.log('✅ Cloudinary connected successfully');
    } else {
      console.log('⚠️ Cloudinary connection test skipped - not configured');
    }
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error);
  }
};

// Call test on import
testConnection();

// Create multer upload middleware with memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

export default cloudinary;
