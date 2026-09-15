/**
 * Dashboard API Routes
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 */

import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardService } from '../services/dashboard.service';
import { IDashboardRepository } from '../repositories/dashboard.repository';

export function createDashboardRouter(
  repository: IDashboardRepository,
  service?: DashboardService
): Router {
  const dashboardService = service || new DashboardService(repository);
  const controller = new DashboardController(dashboardService);
  const router = Router();

  // GET /api/v1/dashboard/transfers
  router.get('/transfers', controller.getTransfers);

  // GET /api/v1/dashboard/transfers/:id/timeline
  router.get('/transfers/:id/timeline', controller.getTimeline);

  // GET /api/v1/dashboard/approvals/pending
  router.get('/approvals/pending', controller.getPendingApprovals);

  return router;
}
