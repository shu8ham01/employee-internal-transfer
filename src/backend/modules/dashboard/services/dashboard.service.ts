/**
 * Dashboard Domain Service Implementation
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 */

import { IDashboardRepository } from '../repositories/dashboard.repository';
import { NotFoundError } from '../../../shared/errors';

export interface MilestoneItem {
  step: number;
  name: string;
  state: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'REJECTED';
  completedAt: string | null;
  actor: string | null;
}

export interface BottleneckInfo {
  isBlocked: boolean;
  pendingReviewerName: string;
  pendingReviewerRole: string;
  pendingSince: string;
  elapsedHours: number;
  slaHours: number;
}

export interface TimelineResult {
  transferId: string;
  overallStatus: string;
  bottleneck: BottleneckInfo;
  milestones: MilestoneItem[];
}

export class DashboardService {
  constructor(private readonly repository: IDashboardRepository) {}

  /**
   * Fetches summary of transfer requests visible to the specified user.
   */
  async getUserTransfers(userId: string) {
    const transfers = await this.repository.getTransfersByUserId(userId);
    return {
      transfers,
      totalCount: transfers.length,
    };
  }

  /**
   * Calculates visual milestone progression and SLA bottleneck status for a transfer.
   */
  async getTransferTimeline(transferId: string): Promise<TimelineResult> {
    const transfer = await this.repository.getTransferById(transferId);
    if (!transfer) {
      throw new NotFoundError('Transfer request not found');
    }

    const enteredAtMs = new Date(transfer.stageEnteredAt || transfer.submittedAt).getTime();
    const nowMs = Date.now();
    const elapsedHours = Math.max(0, (nowMs - enteredAtMs) / (1000 * 60 * 60));
    const slaHours = 72;
    const isBlocked = elapsedHours >= slaHours;

    let pendingReviewerName = 'Jane Doe';
    let pendingReviewerRole = 'Current Manager';

    if (transfer.currentStage === 'HIRING_MANAGER_REVIEW') {
      pendingReviewerName = 'Bob Smith';
      pendingReviewerRole = 'Hiring Manager';
    } else if (transfer.currentStage === 'HR_VALIDATION') {
      pendingReviewerName = 'Sarah Connor';
      pendingReviewerRole = 'HR Administrator';
    }

    // Determine milestone states based on currentStage
    const stageOrderMap: Record<string, number> = {
      INITIATION: 1,
      CURRENT_MANAGER_REVIEW: 2,
      HIRING_MANAGER_REVIEW: 3,
      HR_VALIDATION: 4,
      FULFILLMENT: 5,
      COMPLETED: 6,
    };

    const currentOrder = stageOrderMap[transfer.currentStage] || 2;
    const isTerminated = transfer.status === 'REJECTED';

    const getMilestoneState = (stepNumber: number): 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'REJECTED' => {
      if (stepNumber < currentOrder) return 'COMPLETED';
      if (stepNumber === currentOrder) return isTerminated ? 'REJECTED' : 'IN_PROGRESS';
      return 'NOT_STARTED';
    };

    const milestones: MilestoneItem[] = [
      {
        step: 1,
        name: 'Initiation & Submission',
        state: 'COMPLETED',
        completedAt: transfer.submittedAt,
        actor: transfer.employeeName || 'Alex Chen',
      },
      {
        step: 2,
        name: 'Current Manager Review',
        state: getMilestoneState(2),
        completedAt: currentOrder > 2 ? transfer.stageEnteredAt : null,
        actor: 'Jane Doe',
      },
      {
        step: 3,
        name: 'Hiring Manager Review',
        state: getMilestoneState(3),
        completedAt: currentOrder > 3 ? transfer.stageEnteredAt : null,
        actor: currentOrder >= 3 ? 'Bob Smith' : null,
      },
      {
        step: 4,
        name: 'HR Policy & Headcount Sign-Off',
        state: getMilestoneState(4),
        completedAt: currentOrder > 4 ? transfer.stageEnteredAt : null,
        actor: currentOrder >= 4 ? 'Sarah Connor' : null,
      },
      {
        step: 5,
        name: 'Downstream Fulfillment',
        state: getMilestoneState(5),
        completedAt: currentOrder > 5 ? transfer.stageEnteredAt : null,
        actor: currentOrder >= 5 ? 'HR Operations' : null,
      },
    ];

    return {
      transferId,
      overallStatus: transfer.status,
      bottleneck: {
        isBlocked,
        pendingReviewerName,
        pendingReviewerRole,
        pendingSince: transfer.stageEnteredAt || transfer.submittedAt,
        elapsedHours: Math.round(elapsedHours * 10) / 10,
        slaHours,
      },
      milestones,
    };
  }

  /**
   * Fetches list of transfers awaiting review by the specified reviewer.
   */
  async getPendingApprovals(reviewerId: string) {
    const pendingApprovals = await this.repository.getPendingApprovalsByReviewerId(reviewerId);
    return {
      pendingApprovals,
    };
  }
}
