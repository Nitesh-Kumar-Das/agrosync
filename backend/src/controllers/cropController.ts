import { Request, Response } from 'express';
import mlService from '../services/mlService';
import prisma from '../services/dbService';
import { ResponseUtil } from '../utils/response';
import logger from '../middleware/logger';
import { CropPredictionInput } from '../types/crop';
export class CropController {
  async predictCrop(req: Request, res: Response): Promise<Response> {
    try {
      const input: CropPredictionInput = req.body;
      const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = input;
      if (
        nitrogen === undefined || phosphorus === undefined || potassium === undefined ||
        temperature === undefined || humidity === undefined || ph === undefined || rainfall === undefined
      ) {
        return ResponseUtil.badRequest(res, 'Missing required fields');
      }
      logger.info('Calling ML service for crop prediction');
      const result = await mlService.predictCrop({
        nitrogen,
        phosphorus,
        potassium,
        temperature,
        humidity,
        ph,
        rainfall,
      });
      await prisma.prediction.create({
        data: {
          module: 'crop',
          inputData: JSON.stringify(input),
          result: JSON.stringify(result),
        },
      });
      logger.info(`Crop prediction successful: ${result.crop}`);
      return ResponseUtil.success(res, result, 'Crop prediction successful');
    } catch (error: any) {
      logger.error('Crop prediction error:', error);
      return ResponseUtil.serverError(res, error.message || 'Crop prediction failed');
    }
  }
  async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { limit = 10, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const [predictions, total] = await Promise.all([
        prisma.prediction.findMany({
          where: { module: 'crop' },
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
          skip,
        }),
        prisma.prediction.count({ where: { module: 'crop' } }),
      ]);
      const formattedPredictions = predictions.map((p) => {
        try {
          return {
            id: p.id,
            input: JSON.parse(p.inputData),
            result: JSON.parse(p.result),
            createdAt: p.createdAt,
          };
        } catch (parseError) {
          logger.error(`JSON parse error for prediction ${p.id}:`, parseError);
          return {
            id: p.id,
            input: {},
            result: {},
            createdAt: p.createdAt,
            error: 'Invalid data format',
          };
        }
      });
      return ResponseUtil.success(res, {
        data: formattedPredictions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error: any) {
      logger.error('Get crop history error:', error);
      return ResponseUtil.serverError(res, 'Failed to fetch crop history');
    }
  }
}
export default new CropController();
