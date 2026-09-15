/**
 * Unit Test Suite: Single View of Progress & Transparency Dashboard
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 * Test Cases: .ai-context/test_cases/transparency-dashboard.test_cases.md
 * 
 * Tests cover:
 * - UT01 (AC1): Fetch dashboard summary for applicant
 * - UT02 (AC2): Fetch milestone timeline for active transfer (5 ordered milestones)
 * - UT03 (AC3): Fetch pending approvals scoped to assigned reviewer stage
 * - UT04 (AC4): SLA bottleneck calculation (> 72 hours triggers isBlocked: true)
 * - UT05 (AC5): Zero transfer records returns empty state (transfers: [], totalCount: 0)
 */

import { DashboardService } from '../../../../src/backend/modules/dashboard/services/dashboard.service';
import { IDashboardRepository } from '../../../../src/backend/modules/dashboard/repositories/dashboard.repository';

describe('DashboardService - Transparency Dashboard (TDD RED Phase)', () => {
  let dashboardService: DashboardService;
  let mockRepository: jest.Mocked<IDashboardRepository>;

  const mockTransferSummary = {
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

  beforeEach(() => {
    mockRepository = {
      getTransfersByUserId: jest.fn(),
      getTransferById: jest.fn(),
      getWorkflowStagesByTransferId: jest.fn(),
      getPendingApprovalsByReviewerId: jest.fn(),
    };

    dashboardService = new DashboardService(mockRepository);
  });

  describe('transparency-dashboard.UT01 (AC1) — Fetch Dashboard Summary for Applicant', () => {
    it('should return active transfer list with bottleneck metadata for applicant', async () => {
      mockRepository.getTransfersByUserId.mockResolvedValue([mockTransferSummary]);

      const result = await dashboardService.getUserTransfers('emp-001');

      expect(result.totalCount).toBe(1);
      expect(result.transfers[0].id).toBe('tr-9001');
      expect(result.transfers[0].currentStage).toBe('CURRENT_MANAGER_REVIEW');
      expect(result.transfers[0].pendingWith).toBe('Jane Doe (Current Manager)');
      expect(result.transfers[0].daysInCurrentStage).toBe(2);
    });
  });

  describe('transparency-dashboard.UT02 (AC2) — Fetch Milestone Timeline for Active Transfer', () => {
    it('should return 5 ordered stages with accurate completion flags', async () => {
      mockRepository.getTransferById.mockResolvedValue({
        id: 'tr-9001',
        employeeId: 'emp-001',
        status: 'IN_REVIEW',
        currentStage: 'CURRENT_MANAGER_REVIEW',
        currentManagerId: 'mgr-101',
        submittedAt: '2026-09-13T10:00:00.000Z',
        stageEnteredAt: '2026-09-13T10:00:00.000Z',
      });

      const now = new Date('2026-09-15T11:30:00.000Z').getTime();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const timeline = await dashboardService.getTransferTimeline('tr-9001');

      expect(timeline.transferId).toBe('tr-9001');
      expect(timeline.overallStatus).toBe('IN_REVIEW');
      expect(timeline.milestones).toHaveLength(5);
      expect(timeline.milestones[0].name).toBe('Initiation & Submission');
      expect(timeline.milestones[0].state).toBe('COMPLETED');
      expect(timeline.milestones[1].name).toBe('Current Manager Review');
      expect(timeline.milestones[1].state).toBe('IN_PROGRESS');
      expect(timeline.milestones[2].state).toBe('NOT_STARTED');
      expect(timeline.milestones[3].state).toBe('NOT_STARTED');
      expect(timeline.milestones[4].state).toBe('NOT_STARTED');
    });
  });

  describe('transparency-dashboard.UT03 (AC3) — Fetch Pending Approvals Scoped to Reviewer', () => {
    it('should return only transfers matching authenticated reviewer stage', async () => {
      mockRepository.getPendingApprovalsByReviewerId.mockResolvedValue([
        {
          transferId: 'tr-9001',
          applicantName: 'Alex Chen',
          applicantRole: 'Software Engineer',
          targetRole: 'DevOps Engineer',
          targetDepartment: 'Cloud Infrastructure',
          stage: 'CURRENT_MANAGER_REVIEW',
          submittedDate: '2026-09-13T10:00:00.000Z',
          slaRemainingHours: 22.5,
        },
      ]);

      const result = await dashboardService.getPendingApprovals('mgr-101');

      expect(result.pendingApprovals).toHaveLength(1);
      expect(result.pendingApprovals[0].transferId).toBe('tr-9001');
      expect(result.pendingApprovals[0].stage).toBe('CURRENT_MANAGER_REVIEW');
      expect(mockRepository.getPendingApprovalsByReviewerId).toHaveBeenCalledWith('mgr-101');
    });
  });

  describe('transparency-dashboard.UT04 (AC4) — SLA Bottleneck Calculation (> 72 Hours)', () => {
    it('should flag isBlocked: true when elapsed time exceeds 72 hour SLA', async () => {
      const fourDaysAgo = new Date(Date.now() - 75 * 3600 * 1000).toISOString();
      mockRepository.getTransferById.mockResolvedValue({
        id: 'tr-9001',
        employeeId: 'emp-001',
        status: 'IN_REVIEW',
        currentStage: 'CURRENT_MANAGER_REVIEW',
        currentManagerId: 'mgr-101',
        submittedAt: fourDaysAgo,
        stageEnteredAt: fourDaysAgo,
      });

      const timeline = await dashboardService.getTransferTimeline('tr-9001');

      expect(timeline.bottleneck.isBlocked).toBe(true);
      expect(timeline.bottleneck.elapsedHours).toBeGreaterThanOrEqual(72);
      expect(timeline.bottleneck.slaHours).toBe(72);
    });

    it('should flag isBlocked: false when elapsed time is within 72 hour SLA', async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      mockRepository.getTransferById.mockResolvedValue({
        id: 'tr-9001',
        employeeId: 'emp-001',
        status: 'IN_REVIEW',
        currentStage: 'CURRENT_MANAGER_REVIEW',
        currentManagerId: 'mgr-101',
        submittedAt: oneDayAgo,
        stageEnteredAt: oneDayAgo,
      });

      const timeline = await dashboardService.getTransferTimeline('tr-9001');

      expect(timeline.bottleneck.isBlocked).toBe(false);
      expect(timeline.bottleneck.elapsedHours).toBeLessThan(72);
    });
  });

  describe('transparency-dashboard.UT05 (AC5) — Zero Transfer Records Empty State', () => {
    it('should return empty transfer list and totalCount: 0 for employee with no transfers', async () => {
      mockRepository.getTransfersByUserId.mockResolvedValue([]);

      const result = await dashboardService.getUserTransfers('emp-999');

      expect(result.transfers).toEqual([]);
      expect(result.totalCount).toBe(0);
    });
  });
});
