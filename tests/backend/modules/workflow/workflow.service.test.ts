/**
 * Unit Test Suite: Downstream Stakeholder Workflow Orchestration
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 * Test Cases: .ai-context/test_cases/workflow-orchestration.test_cases.md
 * 
 * Tests cover:
 * - UT01 (AC1): Current Manager approves with release date -> advances to HIRING_MANAGER_REVIEW
 * - UT02 (AC2): Hiring Manager approves candidate -> advances to HR_VALIDATION
 * - UT03 (AC3): HR Administrator approves transfer -> advances to FULFILLMENT with status APPROVED
 * - UT04 (AC4): Reviewer submits REJECT -> immediately terminates workflow as REJECTED
 * - UT05 (AC5): Non-assigned user attempts to submit decision -> HTTP 403 Forbidden
 * - Additional edge cases:
 *   - Caller not participant on GET workflow -> 403 Forbidden
 *   - Transfer request not found -> 404 NotFound
 *   - Submitting decision on terminal state -> 409 Conflict
 *   - Validation failure for missing remarks -> 400 ValidationError
 */

import { WorkflowService } from '../../../../src/backend/modules/workflow/services/workflow.service';
import { IWorkflowRepository, TransferSummary } from '../../../../src/backend/modules/workflow/repositories/workflow.repository';
import { 
  ConflictError, 
  ForbiddenError, 
  NotFoundError, 
  ValidationError 
} from '../../../../src/backend/shared/errors';

describe('WorkflowService - Workflow Orchestration (TDD RED Phase)', () => {
  let workflowService: WorkflowService;
  let mockRepository: jest.Mocked<IWorkflowRepository>;

  const mockTransfer: TransferSummary = {
    id: 'tr-9001',
    employeeId: 'emp-001',
    status: 'IN_REVIEW',
    currentStage: 'CURRENT_MANAGER_REVIEW',
    currentManagerId: 'mgr-101',
    hiringManagerId: 'hm-201',
    hrAdminId: 'hr-301',
  };

  const mockWorkflowState = {
    transferId: 'tr-9001',
    status: 'IN_REVIEW',
    currentStage: {
      id: 'stg-1',
      stageName: 'CURRENT_MANAGER_REVIEW',
      stageOrder: 1,
      assignedReviewer: {
        id: 'mgr-101',
        name: 'Jane Doe',
        role: 'CURRENT_MANAGER',
        email: 'jane.doe@intglobal.com',
      },
      enteredAt: '2026-09-15T11:30:00.000Z',
    },
    completedStages: [],
    history: [
      {
        stage: 'INITIATION',
        actor: 'emp-001',
        action: 'SUBMIT',
        timestamp: '2026-09-15T11:30:00.000Z',
        remarks: 'Transfer initiated',
      },
    ],
  };

  beforeEach(() => {
    mockRepository = {
      findTransferById: jest.fn(),
      getWorkflowState: jest.fn(),
      findCurrentStage: jest.fn(),
      recordDecisionAndAdvance: jest.fn(),
      executeTransaction: jest.fn((cb: () => any) => cb()),
    } as unknown as jest.Mocked<IWorkflowRepository>;

    workflowService = new WorkflowService(mockRepository);
  });

  describe('workflow-orchestration.UT01 (AC1) — Current Manager Approves', () => {
    it('should advance stage to HIRING_MANAGER_REVIEW when Current Manager approves with release date', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer);
      mockRepository.getWorkflowState.mockResolvedValue(mockWorkflowState);
      mockRepository.recordDecisionAndAdvance.mockResolvedValue({
        transferId: 'tr-9001',
        previousStage: 'CURRENT_MANAGER_REVIEW',
        currentStage: 'HIRING_MANAGER_REVIEW',
        status: 'IN_REVIEW',
        decision: {
          actorId: 'mgr-101',
          action: 'APPROVE',
          remarks: 'Release approved effective 2026-11-01. Handover planned for sprint 22.',
          timestamp: '2026-09-15T12:00:00.000Z',
        },
      });

      const result = await workflowService.submitDecision('tr-9001', 'mgr-101', {
        action: 'APPROVE',
        remarks: 'Release approved effective 2026-11-01. Handover planned for sprint 22.',
        targetReleaseDate: '2026-11-01T00:00:00.000Z',
      });

      expect(result.currentStage).toBe('HIRING_MANAGER_REVIEW');
      expect(result.status).toBe('IN_REVIEW');
      expect(mockRepository.recordDecisionAndAdvance).toHaveBeenCalledWith(
        expect.objectContaining({
          transferId: 'tr-9001',
          action: 'APPROVE',
          nextStage: 'HIRING_MANAGER_REVIEW',
          nextStatus: 'IN_REVIEW',
        })
      );
    });
  });

  describe('workflow-orchestration.UT02 (AC2) — Hiring Manager Approves', () => {
    it('should advance stage to HR_VALIDATION when Hiring Manager approves', async () => {
      const hmTransfer: TransferSummary = {
        ...mockTransfer,
        currentStage: 'HIRING_MANAGER_REVIEW',
      };
      mockRepository.findTransferById.mockResolvedValue(hmTransfer);
      mockRepository.getWorkflowState.mockResolvedValue({
        ...mockWorkflowState,
        currentStage: {
          id: 'stg-2',
          stageName: 'HIRING_MANAGER_REVIEW',
          stageOrder: 2,
          assignedReviewer: {
            id: 'hm-201',
            name: 'Bob Smith',
            role: 'HIRING_MANAGER',
            email: 'bob.smith@intglobal.com',
          },
          enteredAt: '2026-09-15T12:00:00.000Z',
        },
      });
      mockRepository.recordDecisionAndAdvance.mockResolvedValue({
        transferId: 'tr-9001',
        previousStage: 'HIRING_MANAGER_REVIEW',
        currentStage: 'HR_VALIDATION',
        status: 'IN_REVIEW',
        decision: {
          actorId: 'hm-201',
          action: 'APPROVE',
          remarks: 'Role fit confirmed. Candidate accepted.',
          timestamp: '2026-09-15T12:30:00.000Z',
        },
      });

      const result = await workflowService.submitDecision('tr-9001', 'hm-201', {
        action: 'APPROVE',
        remarks: 'Role fit confirmed. Candidate accepted.',
      });

      expect(result.currentStage).toBe('HR_VALIDATION');
      expect(result.status).toBe('IN_REVIEW');
      expect(mockRepository.recordDecisionAndAdvance).toHaveBeenCalledWith(
        expect.objectContaining({
          transferId: 'tr-9001',
          action: 'APPROVE',
          nextStage: 'HR_VALIDATION',
          nextStatus: 'IN_REVIEW',
        })
      );
    });
  });

  describe('workflow-orchestration.UT03 (AC3) — HR Administrator Approves', () => {
    it('should advance to FULFILLMENT stage with status APPROVED when HR Administrator approves', async () => {
      const hrTransfer: TransferSummary = {
        ...mockTransfer,
        currentStage: 'HR_VALIDATION',
      };
      mockRepository.findTransferById.mockResolvedValue(hrTransfer);
      mockRepository.getWorkflowState.mockResolvedValue({
        ...mockWorkflowState,
        currentStage: {
          id: 'stg-3',
          stageName: 'HR_VALIDATION',
          stageOrder: 3,
          assignedReviewer: {
            id: 'hr-301',
            name: 'Sarah Connor',
            role: 'HR_ADMIN',
            email: 'sarah.connor@intglobal.com',
          },
          enteredAt: '2026-09-15T12:30:00.000Z',
        },
      });
      mockRepository.recordDecisionAndAdvance.mockResolvedValue({
        transferId: 'tr-9001',
        previousStage: 'HR_VALIDATION',
        currentStage: 'FULFILLMENT',
        status: 'APPROVED',
        decision: {
          actorId: 'hr-301',
          action: 'APPROVE',
          remarks: 'Compensation band and eligibility verified. Transfer approved.',
          timestamp: '2026-09-15T13:00:00.000Z',
        },
      });

      const result = await workflowService.submitDecision('tr-9001', 'hr-301', {
        action: 'APPROVE',
        remarks: 'Compensation band and eligibility verified. Transfer approved.',
      });

      expect(result.currentStage).toBe('FULFILLMENT');
      expect(result.status).toBe('APPROVED');
      expect(mockRepository.recordDecisionAndAdvance).toHaveBeenCalledWith(
        expect.objectContaining({
          transferId: 'tr-9001',
          action: 'APPROVE',
          nextStage: 'FULFILLMENT',
          nextStatus: 'APPROVED',
        })
      );
    });
  });

  describe('workflow-orchestration.UT04 (AC4) — Reviewer Rejection Immediately Terminates', () => {
    it('should immediately terminate workflow as REJECTED when reviewer rejects', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer);
      mockRepository.getWorkflowState.mockResolvedValue(mockWorkflowState);
      mockRepository.recordDecisionAndAdvance.mockResolvedValue({
        transferId: 'tr-9001',
        previousStage: 'CURRENT_MANAGER_REVIEW',
        currentStage: 'CURRENT_MANAGER_REVIEW',
        status: 'REJECTED',
        decision: {
          actorId: 'mgr-101',
          action: 'REJECT',
          remarks: 'Project deliverables cannot spare resource at this time.',
          timestamp: '2026-09-15T12:00:00.000Z',
        },
      });

      const result = await workflowService.submitDecision('tr-9001', 'mgr-101', {
        action: 'REJECT',
        remarks: 'Project deliverables cannot spare resource at this time.',
      });

      expect(result.status).toBe('REJECTED');
      expect(mockRepository.recordDecisionAndAdvance).toHaveBeenCalledWith(
        expect.objectContaining({
          transferId: 'tr-9001',
          action: 'REJECT',
          nextStatus: 'REJECTED',
        })
      );
    });

    it('should block decisions on transfer in terminal state with ConflictError (409)', async () => {
      const rejectedTransfer: TransferSummary = {
        ...mockTransfer,
        status: 'REJECTED',
      };
      mockRepository.findTransferById.mockResolvedValue(rejectedTransfer);

      await expect(
        workflowService.submitDecision('tr-9001', 'mgr-101', {
          action: 'APPROVE',
          remarks: 'Attempting to approve rejected workflow',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('workflow-orchestration.UT05 (AC5) — Authorization Verification (403 Forbidden)', () => {
    it('should throw ForbiddenError when non-assigned user attempts to submit decision', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer);
      mockRepository.getWorkflowState.mockResolvedValue(mockWorkflowState);

      await expect(
        workflowService.submitDecision('tr-9001', 'unauthorized-user-999', {
          action: 'APPROVE',
          remarks: 'Malicious decision submission',
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw ForbiddenError when non-participant attempts to view workflow state', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer);

      await expect(
        workflowService.getWorkflowState('tr-9001', 'unauthorized-outsider')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError when transfer request does not exist', async () => {
      mockRepository.findTransferById.mockResolvedValue(null);

      await expect(
        workflowService.getWorkflowState('non-existent-tr', 'emp-001')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when remarks are empty or invalid', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer);
      mockRepository.getWorkflowState.mockResolvedValue(mockWorkflowState);

      await expect(
        workflowService.submitDecision('tr-9001', 'mgr-101', {
          action: 'APPROVE',
          remarks: '',
        })
      ).rejects.toThrow(ValidationError);
    });
  });
});
