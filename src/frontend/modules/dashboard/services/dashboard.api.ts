/**
 * Dashboard Frontend API Client
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 */

export interface DashboardTransfer {
  id: string;
  employeeName: string;
  employeeId: string;
  proposedDepartment: string;
  proposedRole: string;
  status: string;
  currentStage: string;
  pendingWith: string;
  daysInCurrentStage: number;
  submittedDate: string;
  effectiveDate: string;
}

export interface DashboardTransfersResponse {
  transfers: DashboardTransfer[];
  totalCount: number;
}

export interface Bottleneck {
  isBlocked: boolean;
  pendingReviewerName: string;
  pendingReviewerRole: string;
  pendingSince: string;
  elapsedHours: number;
  slaHours: number;
}

export interface Milestone {
  step: number;
  name: string;
  state: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'REJECTED';
  completedAt: string | null;
  actor: string | null;
}

export interface TimelineResponse {
  transferId: string;
  overallStatus: string;
  bottleneck: Bottleneck;
  milestones: Milestone[];
}

export interface PendingApproval {
  transferId: string;
  applicantName: string;
  applicantRole: string;
  targetRole: string;
  targetDepartment: string;
  stage: string;
  submittedDate: string;
  slaRemainingHours: number;
}

export interface PendingApprovalsResponse {
  pendingApprovals: PendingApproval[];
}

const BASE_URL = '/api/v1/dashboard';

export const dashboardApi = {
  async fetchTransfers(userId?: string): Promise<DashboardTransfersResponse> {
    const headers: Record<string, string> = {};
    if (userId) headers['x-user-id'] = userId;

    const res = await fetch(`${BASE_URL}/transfers`, { headers });
    if (!res.ok) {
      throw new Error('Failed to fetch user transfers');
    }
    return res.json() as Promise<DashboardTransfersResponse>;
  },

  async fetchTimeline(transferId: string): Promise<TimelineResponse> {
    const res = await fetch(`${BASE_URL}/transfers/${transferId}/timeline`);
    if (!res.ok) {
      throw new Error(`Failed to fetch timeline for transfer ${transferId}`);
    }
    return res.json() as Promise<TimelineResponse>;
  },

  async fetchPendingApprovals(reviewerId?: string): Promise<PendingApprovalsResponse> {
    const headers: Record<string, string> = {};
    if (reviewerId) headers['x-user-id'] = reviewerId;

    const res = await fetch(`${BASE_URL}/approvals/pending`, { headers });
    if (!res.ok) {
      throw new Error('Failed to fetch pending approvals');
    }
    return res.json() as Promise<PendingApprovalsResponse>;
  },
};
