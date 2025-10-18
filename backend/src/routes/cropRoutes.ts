import { Router } from 'express';
import cropController from '../controllers/cropController';
import { validate, validationSchemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.post('/predict', authenticateToken, validate(validationSchemas.cropPrediction), cropController.predictCrop.bind(cropController));
router.get('/history', authenticateToken, validate(validationSchemas.pagination, 'query'), cropController.getHistory.bind(cropController));
export default router;
