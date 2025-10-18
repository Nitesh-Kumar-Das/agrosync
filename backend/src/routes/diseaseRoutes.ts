import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import diseaseController from '../controllers/diseaseController';
import storageQuota from '../middleware/storageQuota';
import { authenticateToken } from '../middleware/auth';
const router = Router();
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (_req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    cb(null, 'disease-' + uniqueId + path.extname(file.originalname));
  },
});
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG and PNG are allowed.'));
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 10485760,
  },
});
router.post(
  '/detect',
  authenticateToken,
  async (_req, res, next) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const canUpload = await storageQuota.checkStorageQuota(uploadDir);
    if (!canUpload) {
      return res.status(507).json({
        success: false,
        error: 'Storage quota exceeded. Please try again later.',
      });
    }
    return next();
  },
  upload.single('image'),
  diseaseController.detectDisease.bind(diseaseController)
);
router.get('/history', authenticateToken, diseaseController.getHistory.bind(diseaseController));
export default router;
