import { Request, Response } from 'express';
import mlService from '../services/mlService';
import prisma from '../services/dbService';
import { ResponseUtil } from '../utils/response';
import logger from '../middleware/logger';
import { FertilizerPredictionInput } from '../types/fertilizer';
export class FertilizerController {
  async predictFertilizer(req: Request, res: Response): Promise<Response> {
    try {
      const input: FertilizerPredictionInput = req.body;
      const { temperature, humidity, moisture, soilType, cropType, nitrogen, potassium, phosphorous } = input;
      if (
        temperature === undefined || humidity === undefined || moisture === undefined ||
        !soilType || !cropType || nitrogen === undefined || potassium === undefined || phosphorous === undefined
      ) {
        return ResponseUtil.badRequest(res, 'Missing required fields');
      }
      logger.info('Calling ML service for fertilizer prediction');
      const result = await mlService.predictFertilizer({
        temperature,
        humidity,
        moisture,
        soil_type: soilType,
        crop_type: cropType,
        nitrogen,
        potassium,
        phosphorous,
      });
      await prisma.prediction.create({
        data: {
          module: 'fertilizer',
          inputData: JSON.stringify(input),
          result: JSON.stringify(result),
        },
      });
      logger.info(`Fertilizer prediction successful: ${result.fertilizer}`);
      return ResponseUtil.success(res, result, 'Fertilizer prediction successful');
    } catch (error: any) {
      logger.error('Fertilizer prediction error:', error);
      return ResponseUtil.serverError(res, error.message || 'Fertilizer prediction failed');
    }
  }
  async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { limit = 10, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const [predictions, total] = await Promise.all([
        prisma.prediction.findMany({
          where: { module: 'fertilizer' },
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
          skip,
        }),
        prisma.prediction.count({ where: { module: 'fertilizer' } }),
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
      logger.error('Get fertilizer history error:', error);
      return ResponseUtil.serverError(res, 'Failed to fetch fertilizer history');
    }
  }
}
export default new FertilizerController();
