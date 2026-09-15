/**
 * Workflow API Routes
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 */

import { Router } from 'express';
import { WorkflowController } from '../controllers/workflow.controller';
import { WorkflowService } from '../services/workflow.service';
import { IWorkflowRepository } from '../repositories/workflow.repository';

export function createWorkflowRouter(
  repository: IWorkflowRepository,
  service?: WorkflowService
): Router {
  const workflowService = service || new WorkflowService(repository);
  const controller = new WorkflowController(workflowService);
  const router = Router();

  // GET /api/v1/transfers/:id/workflow
  router.get('/:id/workflow', controller.getWorkflow);

  // POST /api/v1/transfers/:id/decisions
  router.post('/:id/decisions', controller.submitDecision);

  return router;
}
