/**
 * Frontend Component & Hook Type Checks and Verification: Workflow Module
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 */

import { WorkflowState, SubmitDecisionPayload, DecisionResult } from '../../../../src/frontend/modules/workflow/services/workflow.api';
import { StageStepper } from '../../../../src/frontend/modules/workflow/components/StageStepper';
import { DecisionActionPanel } from '../../../../src/frontend/modules/workflow/components/DecisionActionPanel';
import { WorkflowDetailPage } from '../../../../src/frontend/modules/workflow/pages/WorkflowDetailPage';

describe('Frontend Workflow Module Structure & Contract Verification', () => {
  it('should export all required UI components', () => {
    expect(StageStepper).toBeDefined();
    expect(DecisionActionPanel).toBeDefined();
    expect(WorkflowDetailPage).toBeDefined();
  });

  it('should validate WorkflowState schema structure', () => {
    const mockState: WorkflowState = {
      transferId: 'tr-9001',
      status: 'IN_REVIEW',
      currentStage: {
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

    expect(mockState.transferId).toBe('tr-9001');
    expect(mockState.status).toBe('IN_REVIEW');
    expect(mockState.currentStage?.stageName).toBe('CURRENT_MANAGER_REVIEW');
    expect(mockState.currentStage?.assignedReviewer?.name).toBe('Jane Doe');
    expect(mockState.history.length).toBe(1);
  });

  it('should validate SubmitDecisionPayload structure', () => {
    const payload: SubmitDecisionPayload = {
      action: 'APPROVE',
      remarks: 'Handover complete and release approved.',
      targetReleaseDate: '2026-11-01T00:00:00.000Z',
    };

    expect(payload.action).toBe('APPROVE');
    expect(payload.remarks).toContain('Handover complete');
    expect(payload.targetReleaseDate).toBeDefined();
  });

  it('should validate DecisionResult structure', () => {
    const result: DecisionResult = {
      transferId: 'tr-9001',
      previousStage: 'CURRENT_MANAGER_REVIEW',
      currentStage: 'HIRING_MANAGER_REVIEW',
      status: 'IN_REVIEW',
      decision: {
        actorId: 'mgr-101',
        action: 'APPROVE',
        remarks: 'Release approved.',
        timestamp: '2026-09-15T12:00:00.000Z',
      },
    };

    expect(result.previousStage).toBe('CURRENT_MANAGER_REVIEW');
    expect(result.currentStage).toBe('HIRING_MANAGER_REVIEW');
    expect(result.decision.action).toBe('APPROVE');
  });
});
