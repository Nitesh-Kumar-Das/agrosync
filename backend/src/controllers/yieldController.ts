import { Request, Response } from 'express';
import mlService from '../services/mlService';
import prisma from '../services/dbService';
import { ResponseUtil } from '../utils/response';
import logger from '../middleware/logger';
import { YieldPredictionInput } from '../types/yield';
export class YieldController {
  async predictYield(req: Request, res: Response): Promise<Response> {
    try {
      const input: YieldPredictionInput = req.body;
      const { state, district, season, crop, year, area, rainfall } = input;
      if (!state || !district || !season || !crop || year === undefined || area === undefined || rainfall === undefined) {
        return ResponseUtil.badRequest(res, 'Missing required fields');
      }
      logger.info('Calling ML service for yield prediction');
      const result = await mlService.predictYield({
        state,
        district,
        season,
        crop,
        year,
        area,
        rainfall,
      });
      await prisma.prediction.create({
        data: {
          module: 'yield',
          inputData: JSON.stringify(input),
          result: JSON.stringify(result),
        },
      });
      logger.info(`Yield prediction successful: ${result.predictedYield} ${result.unit}`);
      return ResponseUtil.success(res, result, 'Yield prediction successful');
    } catch (error: any) {
      logger.error('Yield prediction error:', error);
      return ResponseUtil.serverError(res, error.message || 'Yield prediction failed');
    }
  }
  async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { limit = 10, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const [predictions, total] = await Promise.all([
        prisma.prediction.findMany({
          where: { module: 'yield' },
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
          skip,
        }),
        prisma.prediction.count({ where: { module: 'yield' } }),
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
      logger.error('Get yield history error:', error);
      return ResponseUtil.serverError(res, 'Failed to fetch yield history');
    }
  }
}
export default new YieldController();
