import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service.js';
import { aiChatSchema, aiInsightsQuerySchema } from './ai.schema.js';

export class AiController {
  async generateInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const insights = await aiService.generateInsights(req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Financial insights generated successfully',
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  }

  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = aiChatSchema.parse(req.body);
      const reply = await aiService.chat(req.user!.userId, validated);

      res.status(200).json({
        success: true,
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = aiInsightsQuerySchema.parse(req.query);
      const history = await aiService.getHistory(req.user!.userId, query);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async dismiss(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const success = await aiService.dismissInsight(req.user!.userId, req.params.id);

      res.status(200).json({
        success,
        message: success ? 'Insight dismissed' : 'Insight not found',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
