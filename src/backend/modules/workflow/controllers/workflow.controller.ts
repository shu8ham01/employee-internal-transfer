/**
 * Workflow HTTP Controller
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 */

import { Request, Response, NextFunction } from 'express';
import { WorkflowService } from '../services/workflow.service';

export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  getWorkflow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const currentUserId = 
        (req.headers['x-user-id'] as string) || 
        (req.query.userId as string) || 
        (req.headers['x-employee-id'] as string) || 
        'emp-001';
      
      const workflowState = await this.workflowService.getWorkflowState(id, currentUserId);
      res.status(200).json(workflowState);
    } catch (error) {
      next(error);
    }
  };

  submitDecision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const actorId = 
        (req.headers['x-user-id'] as string) || 
        req.body.actorId || 
        'mgr-101';

      const result = await this.workflowService.submitDecision(id, actorId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
