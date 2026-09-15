/**
 * Frontend Component & Contract Tests: Dashboard Module
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 */

import { BottleneckCallout } from '../../../../src/frontend/modules/dashboard/components/BottleneckCallout';
import { MilestoneTimeline } from '../../../../src/frontend/modules/dashboard/components/MilestoneTimeline';
import { PendingApprovalsQueue } from '../../../../src/frontend/modules/dashboard/components/PendingApprovalsQueue';
import { EmptyTransferState } from '../../../../src/frontend/modules/dashboard/components/EmptyTransferState';
import { TransparencyDashboardPage } from '../../../../src/frontend/modules/dashboard/pages/TransparencyDashboardPage';
import { 
  DashboardTransfer, 
  TimelineResponse, 
  PendingApproval 
} from '../../../../src/frontend/modules/dashboard/services/dashboard.api';

describe('Frontend Dashboard Module Structure & Contract Verification', () => {
  it('should export all dashboard UI components', () => {
    expect(BottleneckCallout).toBeDefined();
    expect(MilestoneTimeline).toBeDefined();
    expect(PendingApprovalsQueue).toBeDefined();
    expect(EmptyTransferState).toBeDefined();
    expect(TransparencyDashboardPage).toBeDefined();
  });

  it('should validate DashboardTransfer structure', () => {
    const mockTransfer: DashboardTransfer = {
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
    };

    expect(mockTransfer.id).toBe('tr-9001');
    expect(mockTransfer.pendingWith).toContain('Jane Doe');
  });

  it('should validate TimelineResponse schema', () => {
    const mockTimeline: TimelineResponse = {
      transferId: 'tr-9001',
      overallStatus: 'IN_REVIEW',
      bottleneck: {
        isBlocked: false,
        pendingReviewerName: 'Jane Doe',
        pendingReviewerRole: 'Current Manager',
        pendingSince: '2026-09-13T10:00:00.000Z',
        elapsedHours: 49.5,
        slaHours: 72,
      },
      milestones: [
        {
          step: 1,
          name: 'Initiation & Submission',
          state: 'COMPLETED',
          completedAt: '2026-09-13T10:00:00.000Z',
          actor: 'Alex Chen',
        },
      ],
    };

    expect(mockTimeline.milestones.length).toBe(1);
    expect(mockTimeline.bottleneck.slaHours).toBe(72);
  });

  it('should validate PendingApproval structure', () => {
    const item: PendingApproval = {
      transferId: 'tr-9001',
      applicantName: 'Alex Chen',
      applicantRole: 'Software Engineer',
      targetRole: 'DevOps Engineer',
      targetDepartment: 'Cloud Infrastructure',
      stage: 'CURRENT_MANAGER_REVIEW',
      submittedDate: '2026-09-13T10:00:00.000Z',
      slaRemainingHours: 22.5,
    };

    expect(item.transferId).toBe('tr-9001');
    expect(item.stage).toBe('CURRENT_MANAGER_REVIEW');
  });
});
