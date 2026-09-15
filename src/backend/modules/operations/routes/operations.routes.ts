/**
 * Operations API Routes
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 */

import { Router } from 'express';
import { OperationsController } from '../controllers/operations.controller';
import { OperationsService } from '../services/operations.service';
import { IOperationsRepository } from '../repositories/operations.repository';

export function createOperationsRouter(
  repository: IOperationsRepository,
  service?: OperationsService
): Router {
  const operationsService = service || new OperationsService(repository);
  const controller = new OperationsController(operationsService);
  const router = Router();

  // GET /api/v1/transfers/:id/operational-tasks
  router.get('/:id/operational-tasks', controller.getTasks);

  // PATCH /api/v1/transfers/:id/operational-tasks/:taskId
  router.patch('/:id/operational-tasks/:taskId', controller.updateTask);

  // POST /api/v1/transfers/:id/complete
  router.post('/:id/complete', controller.completeTransfer);

  return router;
}
