/**
 * Unit Test Suite for Audit Logging & Notification Services
 * Covers AC1-AC5 / UT01-UT05 for notifications-and-audit spec
 */

import { AuditService } from '../../../../src/backend/modules/audit/services/audit.service';
import { InMemoryAuditRepository } from '../../../../src/backend/modules/audit/repositories/audit.repository';
import { NotificationService } from '../../../../src/backend/modules/notifications/services/notification.service';
import { InMemoryNotificationRepository } from '../../../../src/backend/modules/notifications/repositories/notification.repository';

describe('AuditService & NotificationService (BRD-005)', () => {
  let auditRepo: InMemoryAuditRepository;
  let auditService: AuditService;
  let notifRepo: InMemoryNotificationRepository;
  let notifService: NotificationService;

  beforeEach(() => {
    auditRepo = new InMemoryAuditRepository();
    auditService = new AuditService(auditRepo);
    notifRepo = new InMemoryNotificationRepository();
    notifService = new NotificationService(notifRepo);
  });

  describe('notifications-and-audit.UT01 / AC1: Trigger transfer state change creates AuditLog', () => {
    it('should create an immutable audit record when a transfer state changes', async () => {
      const event = await auditService.recordEvent({
        transferId: 'tr-9001',
        action: 'TRANSFER_SUBMITTED',
        actorId: 'emp-001',
        actorRole: 'APPLICANT',
        fromState: null,
        toState: 'SUBMITTED',
        ipAddress: '192.168.1.50',
        metadata: { proposedDepartmentId: 'dept-102', proposedRoleId: 'role-202' },
      });

      expect(event).toBeDefined();
      expect(event.id).toMatch(/^audit-/);
      expect(event.transferId).toBe('tr-9001');
      expect(event.action).toBe('TRANSFER_SUBMITTED');
      expect(event.fromState).toBeNull();
      expect(event.toState).toBe('SUBMITTED');
      expect(event.timestamp).toBeDefined();

      const trail = await auditService.getAuditTrail('tr-9001');
      expect(trail.transferId).toBe('tr-9001');
      expect(trail.auditEvents).toHaveLength(1);
      expect(trail.auditEvents[0].id).toBe(event.id);
    });
  });

  describe('notifications-and-audit.UT02 / AC2: Verify audit log captures IP & sanitizes PII', () => {
    it('should capture actor ID, timestamp, and IP address while scrubbing sensitive PII fields', async () => {
      const event = await auditService.recordEvent({
        transferId: 'tr-9002',
        action: 'STAGE_APPROVED',
        actorId: 'mgr-101',
        actorRole: 'CURRENT_MANAGER',
        fromState: 'CURRENT_MANAGER_REVIEW',
        toState: 'HIRING_MANAGER_REVIEW',
        ipAddress: '10.0.0.45',
        metadata: {
          remarks: 'Release approved',
          ssn: '123-45-6789',
          password: 'superSecretPassword',
          rawSalary: 125000,
        },
      });

      expect(event.actorId).toBe('mgr-101');
      expect(event.actorRole).toBe('CURRENT_MANAGER');
      expect(event.ipAddress).toBe('10.0.0.45');
      expect(event.timestamp).toBeDefined();

      // Zero unmasked PII verification
      expect(event.metadata).not.toHaveProperty('ssn');
      expect(event.metadata).not.toHaveProperty('password');
      expect(event.metadata).not.toHaveProperty('rawSalary');
      expect(event.metadata.remarks).toBe('Release approved');
    });

    it('should handle logging gracefully without throwing even if invalid metadata is passed', async () => {
      await expect(
        auditService.recordEvent({
          transferId: 'tr-9003',
          action: 'LOG_TEST',
          actorId: 'system',
          actorRole: 'SYSTEM',
          fromState: null,
          toState: null,
          ipAddress: '127.0.0.1',
          metadata: null as any,
        })
      ).resolves.toBeDefined();
    });
  });

  describe('notifications-and-audit.UT03 / AC3: Move transfer to new stage dispatches reviewer notification', () => {
    it('should dispatch an in-app and simulated email notification to the incoming reviewer', async () => {
      const notification = await notifService.dispatchStageTransitionNotification({
        transferId: 'tr-9001',
        recipientId: 'mgr-201',
        stage: 'HIRING_MANAGER_REVIEW',
        applicantName: 'Alice Developer',
      });

      expect(notification).toBeDefined();
      expect(notification.recipientId).toBe('mgr-201');
      expect(notification.type).toBe('WORKFLOW_UPDATE');
      expect(notification.title).toContain('Hiring Manager Review');
      expect(notification.isRead).toBe(false);
      expect(notification.actionUrl).toBe('/transfers/tr-9001');

      const userNotifs = await notifService.getUserNotifications('mgr-201');
      expect(userNotifs.unreadCount).toBe(1);
      expect(userNotifs.notifications).toHaveLength(1);
    });
  });

  describe('notifications-and-audit.UT04 / AC4: Reviewer submits decision dispatches applicant notification', () => {
    it('should dispatch an in-app notification to the applicant when a decision is recorded', async () => {
      const notification = await notifService.dispatchDecisionNotification({
        transferId: 'tr-9001',
        applicantId: 'emp-001',
        reviewerName: 'Bob Manager',
        decision: 'APPROVED',
        stageName: 'Current Manager Review',
        remarks: 'Approved with effective handover.',
      });

      expect(notification).toBeDefined();
      expect(notification.recipientId).toBe('emp-001');
      expect(notification.type).toBe('WORKFLOW_UPDATE');
      expect(notification.title).toContain('Transfer Request Approved');
      expect(notification.message).toContain('Bob Manager');
      expect(notification.isRead).toBe(false);

      const userNotifs = await notifService.getUserNotifications('emp-001');
      expect(userNotifs.unreadCount).toBe(1);
      expect(userNotifs.notifications[0].id).toBe(notification.id);
    });
  });

  describe('notifications-and-audit.UT05 / AC5: User marks notification read decrements unread counter', () => {
    it('should mark notification read and decrement unread counter accurately', async () => {
      // Dispatch 2 notifications
      const n1 = await notifService.dispatchDecisionNotification({
        transferId: 'tr-9001',
        applicantId: 'emp-001',
        reviewerName: 'Manager A',
        decision: 'APPROVED',
        stageName: 'Stage 1',
      });
      const n2 = await notifService.dispatchDecisionNotification({
        transferId: 'tr-9002',
        applicantId: 'emp-001',
        reviewerName: 'Manager B',
        decision: 'REVISION_REQUESTED',
        stageName: 'Stage 2',
      });

      let state = await notifService.getUserNotifications('emp-001');
      expect(state.unreadCount).toBe(2);
      expect(state.notifications).toHaveLength(2);

      // Mark n1 as read
      const updated = await notifService.markAsRead(n1.id);
      expect(updated.id).toBe(n1.id);
      expect(updated.isRead).toBe(true);
      expect(updated.readAt).toBeDefined();

      state = await notifService.getUserNotifications('emp-001');
      expect(state.unreadCount).toBe(1);
      const readItem = state.notifications.find((n) => n.id === n1.id);
      expect(readItem?.isRead).toBe(true);
    });

    it('should throw error when trying to mark non-existent notification as read', async () => {
      await expect(notifService.markAsRead('non-existent-id')).rejects.toThrow(
        'Notification not found'
      );
    });
  });
});
