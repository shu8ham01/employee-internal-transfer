/**
 * Dashboard HTTP Controller
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 */

import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getTransfers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = 
        (req.headers['x-user-id'] as string) || 
        (req.query.userId as string) || 
        (req.headers['x-employee-id'] as string) || 
        'emp-001';

      const data = await this.dashboardService.getUserTransfers(userId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const timeline = await this.dashboardService.getTransferTimeline(id);
      res.status(200).json(timeline);
    } catch (error) {
      next(error);
    }
  };

  getPendingApprovals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviewerId = 
        (req.headers['x-user-id'] as string) || 
        (req.query.reviewerId as string) || 
        (req.headers['x-employee-id'] as string) || 
        'mgr-101';

      const approvals = await this.dashboardService.getPendingApprovals(reviewerId);
      res.status(200).json(approvals);
    } catch (error) {
      next(error);
    }
  };
}
