/**
 * Workflow Domain Service Implementation
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 */

import { IWorkflowRepository } from '../repositories/workflow.repository';
import { validateWorkflowDecision, WorkflowDecisionInput } from '../validators/workflow.validator';
import { 
  ConflictError, 
  ForbiddenError, 
  NotFoundError, 
  ValidationError 
} from '../../../shared/errors';

export class WorkflowService {
  constructor(private readonly repository: IWorkflowRepository) {}

  /**
   * Retrieves the active workflow execution state for an authorized participant.
   */
  async getWorkflowState(transferId: string, currentUserId: string) {
    const transfer = await this.repository.findTransferById(transferId);
    if (!transfer) {
      throw new NotFoundError('Transfer request does not exist');
    }

    // Verify user is an authorized participant (applicant, assigned reviewers, or HR Admin)
    const isParticipant = 
      transfer.employeeId === currentUserId ||
      transfer.currentManagerId === currentUserId ||
      transfer.hiringManagerId === currentUserId ||
      transfer.hrAdminId === currentUserId;

    if (!isParticipant) {
      throw new ForbiddenError('Access restricted to workflow participants');
    }

    const state = await this.repository.getWorkflowState(transferId);
    if (!state) {
      throw new NotFoundError('Workflow instance not found');
    }

    return state;
  }

  /**
   * Submits an approval or rejection decision and advances the workflow stage atomically.
   */
  async submitDecision(transferId: string, actorId: string, input: unknown) {
    // Validate request payload
    const payload = validateWorkflowDecision(input);

    // Retrieve transfer
    const transfer = await this.repository.findTransferById(transferId);
    if (!transfer) {
      throw new NotFoundError('Transfer request does not exist');
    }

    // Check if workflow is already in a terminal state
    if (transfer.status === 'REJECTED' || transfer.status === 'COMPLETED') {
      throw new ConflictError('Workflow is closed and cannot receive decisions');
    }

    // Check active stage details
    const workflowState = await this.repository.getWorkflowState(transferId);
    const assignedReviewerId = workflowState?.currentStage?.assignedReviewer?.id;

    // Verify caller is the assigned reviewer for the active stage
    const isAuthorizedReviewer = 
      (assignedReviewerId && assignedReviewerId === actorId) ||
      (transfer.currentStage === 'CURRENT_MANAGER_REVIEW' && transfer.currentManagerId === actorId) ||
      (transfer.currentStage === 'HIRING_MANAGER_REVIEW' && transfer.hiringManagerId === actorId) ||
      (transfer.currentStage === 'HR_VALIDATION' && transfer.hrAdminId === actorId);

    if (!isAuthorizedReviewer) {
      throw new ForbiddenError('You are not authorized to submit decisions for this stage');
    }

    // Determine state and stage progression based on action and stage
    let nextStage: string | undefined = transfer.currentStage;
    let nextStatus: string = transfer.status;

    if (payload.action === 'REJECT') {
      nextStatus = 'REJECTED';
    } else if (payload.action === 'REQUEST_REVISION') {
      nextStatus = 'CHANGES_REQUESTED';
    } else if (payload.action === 'APPROVE') {
      switch (transfer.currentStage) {
        case 'CURRENT_MANAGER_REVIEW':
          nextStage = 'HIRING_MANAGER_REVIEW';
          nextStatus = 'IN_REVIEW';
          break;
        case 'HIRING_MANAGER_REVIEW':
          nextStage = 'HR_VALIDATION';
          nextStatus = 'IN_REVIEW';
          break;
        case 'HR_VALIDATION':
          nextStage = 'FULFILLMENT';
          nextStatus = 'APPROVED';
          break;
        default:
          nextStatus = 'IN_REVIEW';
      }
    }

    // Atomic transaction execution
    return await this.repository.executeTransaction(async () => {
      return await this.repository.recordDecisionAndAdvance({
        transferId,
        actorId,
        action: payload.action,
        remarks: payload.remarks,
        targetReleaseDate: payload.targetReleaseDate,
        nextStage,
        nextStatus,
      });
    });
  }
}
