/**
 * Operational Tasks HTTP Controller
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 */

import { Request, Response, NextFunction } from 'express';
import { OperationsService } from '../services/operations.service';

export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const tasks = await this.operationsService.getOperationalTasks(id);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id, taskId } = req.params;
      const updated = await this.operationsService.updateTask(id, taskId, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  completeTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = 
        (req.headers['x-user-id'] as string) || 
        req.body.userId || 
        'hr-301';
      const role = 
        (req.headers['x-user-role'] as string) || 
        req.body.role || 
        'HR_ADMIN';

      const result = await this.operationsService.completeTransfer(id, userId, role);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
