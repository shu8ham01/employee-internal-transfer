/**
 * Dashboard Repository Implementation & Interfaces
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 */

export interface DashboardTransferItem {
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

export interface TransferDetail {
  id: string;
  employeeId: string;
  employeeName?: string;
  status: string;
  currentStage: string;
  currentManagerId?: string;
  hiringManagerId?: string;
  hrAdminId?: string;
  submittedAt: string;
  stageEnteredAt: string;
}

export interface PendingApprovalItem {
  transferId: string;
  applicantName: string;
  applicantRole: string;
  targetRole: string;
  targetDepartment: string;
  stage: string;
  submittedDate: string;
  slaRemainingHours: number;
}

export interface IDashboardRepository {
  getTransfersByUserId(userId: string): Promise<DashboardTransferItem[]>;
  getTransferById(transferId: string): Promise<TransferDetail | null>;
  getWorkflowStagesByTransferId(transferId: string): Promise<any[]>;
  getPendingApprovalsByReviewerId(reviewerId: string): Promise<PendingApprovalItem[]>;
}

export class InMemoryDashboardRepository implements IDashboardRepository {
  private transfers: DashboardTransferItem[] = [
    {
      id: 'tr-9001',
      employeeName: 'Alex Chen',
      employeeId: 'emp-001',
      proposedDepartment: 'Cloud Infrastructure',
      proposedRole: 'DevOps Engineer',
      status: 'IN_REVIEW',
      currentStage: 'CURRENT_MANAGER_REVIEW',
      pendingWith: 'Jane Doe (Current Manager)',
      daysInCurrentStage: 2,
      submittedDate: '2026-09-13T10:00:00.000Z',
      effectiveDate: '2026-11-01T00:00:00.000Z',
    },
  ];

  private details: Map<string, TransferDetail> = new Map([
    [
      'tr-9001',
      {
        id: 'tr-9001',
        employeeId: 'emp-001',
        employeeName: 'Alex Chen',
        status: 'IN_REVIEW',
        currentStage: 'CURRENT_MANAGER_REVIEW',
        currentManagerId: 'mgr-101',
        hiringManagerId: 'hm-201',
        hrAdminId: 'hr-301',
        submittedAt: '2026-09-13T10:00:00.000Z',
        stageEnteredAt: '2026-09-13T10:00:00.000Z',
      },
    ],
  ]);

  async getTransfersByUserId(userId: string): Promise<DashboardTransferItem[]> {
    return this.transfers.filter((t) => t.employeeId === userId);
  }

  async getTransferById(transferId: string): Promise<TransferDetail | null> {
    return this.details.get(transferId) || null;
  }

  async getWorkflowStagesByTransferId(_transferId: string): Promise<any[]> {
    return [];
  }

  async getPendingApprovalsByReviewerId(reviewerId: string): Promise<PendingApprovalItem[]> {
    const results: PendingApprovalItem[] = [];

    for (const d of this.details.values()) {
      if (d.status !== 'IN_REVIEW') continue;

      let isAssigned = false;
      if (d.currentStage === 'CURRENT_MANAGER_REVIEW' && d.currentManagerId === reviewerId) {
        isAssigned = true;
      } else if (d.currentStage === 'HIRING_MANAGER_REVIEW' && d.hiringManagerId === reviewerId) {
        isAssigned = true;
      } else if (d.currentStage === 'HR_VALIDATION' && d.hrAdminId === reviewerId) {
        isAssigned = true;
      }

      if (isAssigned) {
        const entered = new Date(d.stageEnteredAt).getTime();
        const now = Date.now();
        const elapsedHours = (now - entered) / (1000 * 60 * 60);
        const slaRemaining = Math.max(0, Math.round((72 - elapsedHours) * 10) / 10);

        results.push({
          transferId: d.id,
          applicantName: d.employeeName || 'Alex Chen',
          applicantRole: 'Software Engineer',
          targetRole: 'DevOps Engineer',
          targetDepartment: 'Cloud Infrastructure',
          stage: d.currentStage,
          submittedDate: d.submittedAt,
          slaRemainingHours: slaRemaining,
        });
      }
    }

    return results;
  }
}
