import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { authenticateToken } from '../middleware/auth.js';
import { uploadLimiter, searchLimiter } from '../middleware/rateLimiter.js';
import {
  getMarketplace,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getUserItems,
  getItemStats
} from '../controllers/itemController.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${nanoid()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, JPG, and PNG are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_UPLOAD_SIZE || '104857600')
  }
});

router.get('/marketplace', searchLimiter, getMarketplace);
router.get('/my-items', authenticateToken, getUserItems);
router.get('/stats', authenticateToken, getItemStats);
router.get('/:id', getItemById);
router.post('/', authenticateToken, uploadLimiter, upload.single('file'), createItem);
router.put('/:id', authenticateToken, updateItem);
router.delete('/:id', authenticateToken, deleteItem);

export default router;
