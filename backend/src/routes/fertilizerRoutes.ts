import { Router } from 'express';
import fertilizerController from '../controllers/fertilizerController';
import { validate, validationSchemas } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
const router = Router();
router.post('/predict', authenticateToken, validate(validationSchemas.fertilizerPrediction), fertilizerController.predictFertilizer.bind(fertilizerController));
router.get('/history', authenticateToken, validate(validationSchemas.pagination, 'query'), fertilizerController.getHistory.bind(fertilizerController));
export default router;
