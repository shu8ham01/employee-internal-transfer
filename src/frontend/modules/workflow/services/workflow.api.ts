/**
 * Workflow Frontend API Client
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 */

export interface Reviewer {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface WorkflowStage {
  id?: string;
  stageName: 'CURRENT_MANAGER_REVIEW' | 'HIRING_MANAGER_REVIEW' | 'HR_VALIDATION' | 'FULFILLMENT' | string;
  stageOrder: number;
  assignedReviewer?: Reviewer;
  enteredAt: string;
  completedAt?: string;
  status?: string;
}

export interface WorkflowHistoryItem {
  stage: string;
  actor: string;
  action: string;
  timestamp: string;
  remarks: string;
}

export interface WorkflowState {
  transferId: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | string;
  currentStage: WorkflowStage | null;
  completedStages: WorkflowStage[];
  history: WorkflowHistoryItem[];
}

export interface SubmitDecisionPayload {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_REVISION';
  remarks: string;
  targetReleaseDate?: string;
}

export interface DecisionResult {
  transferId: string;
  previousStage: string;
  currentStage: string;
  status: string;
  decision: {
    actorId: string;
    action: string;
    remarks: string;
    timestamp: string;
  };
}

const BASE_URL = '/api/v1/transfers';

export const workflowApi = {
  async fetchWorkflowState(transferId: string): Promise<WorkflowState> {
    const res = await fetch(`${BASE_URL}/${transferId}/workflow`);
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new Error(err.message || 'Failed to fetch workflow state');
    }
    return res.json() as Promise<WorkflowState>;
  },

  async submitDecision(
    transferId: string,
    payload: SubmitDecisionPayload
  ): Promise<DecisionResult> {
    const res = await fetch(`${BASE_URL}/${transferId}/decisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      const message = data.message || (data.details ? data.details.join(', ') : 'Failed to submit decision');
      const error = new Error(message) as any;
      error.status = res.status;
      error.details = data.details;
      throw error;
    }

    return data as DecisionResult;
  },
};
