import { Router } from 'express';
import yieldController from '../controllers/yieldController';
import { validate, validationSchemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.post('/predict', authenticateToken, validate(validationSchemas.yieldPrediction), yieldController.predictYield.bind(yieldController));
router.get('/history', authenticateToken, validate(validationSchemas.pagination, 'query'), yieldController.getHistory.bind(yieldController));
export default router;
