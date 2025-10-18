import { Request, Response } from 'express';
import mlService from '../services/mlService';
import prisma from '../services/dbService';
import { ResponseUtil } from '../utils/response';
import logger from '../middleware/logger';
import fs from 'fs/promises';
export class DiseaseController {
  async detectDisease(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return ResponseUtil.badRequest(res, 'No image file provided');
      }
      const file = req.file;
      logger.info(`Processing disease detection for file: ${file.originalname}`);
      const imageBuffer = await fs.readFile(file.path);
      const result = await mlService.detectDisease(imageBuffer, file.originalname);
      await prisma.prediction.create({
        data: {
          module: 'disease',
          inputData: JSON.stringify({
            filename: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
          }),
          result: JSON.stringify(result),
        },
      });
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        logger.warn('Failed to delete uploaded file:', unlinkError);
      }
      logger.info(`Disease detection successful: ${result.disease}`);
      return ResponseUtil.success(res, result, 'Disease detection successful');
    } catch (error: any) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          logger.warn('Failed to delete uploaded file on error:', unlinkError);
        }
      }
      logger.error('Disease detection error:', error);
      return ResponseUtil.serverError(res, error.message || 'Disease detection failed');
    }
  }
  async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { limit = 10, page = 1 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const [predictions, total] = await Promise.all([
        prisma.prediction.findMany({
          where: { module: 'disease' },
          orderBy: { createdAt: 'desc' },
          take: Number(limit),
          skip,
        }),
        prisma.prediction.count({ where: { module: 'disease' } }),
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
      logger.error('Get disease history error:', error);
      return ResponseUtil.serverError(res, 'Failed to fetch disease history');
    }
  }
}
export default new DiseaseController();
