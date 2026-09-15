/**
 * Frontend Component & Contract Tests: Notifications & Audit Module
 * Spec: .ai-context/specs/notifications-and-audit.spec.md
 */

import { NotificationBell } from '../../../../src/frontend/modules/notifications/components/NotificationBell';
import { AuditTrailDrawer } from '../../../../src/frontend/modules/notifications/components/AuditTrailDrawer';
import { NotificationsAuditDemoPage } from '../../../../src/frontend/modules/notifications/pages/NotificationsAuditDemoPage';
import { useNotifications } from '../../../../src/frontend/modules/notifications/hooks/useNotifications';
import {
  NotificationItem,
  NotificationsResponse,
  MarkReadResponse,
  AuditEventItem,
  AuditTrailResponse,
} from '../../../../src/frontend/modules/notifications/services/notifications.api';

describe('Frontend Notifications & Audit Module Structure & Contract Verification', () => {
  it('should export all notification and audit UI components and hooks', () => {
    expect(NotificationBell).toBeDefined();
    expect(AuditTrailDrawer).toBeDefined();
    expect(NotificationsAuditDemoPage).toBeDefined();
    expect(useNotifications).toBeDefined();
  });

  it('should validate NotificationItem data structure contract', () => {
    const item: NotificationItem = {
      id: 'notif-501',
      type: 'WORKFLOW_UPDATE',
      title: 'Transfer Request Approved by Current Manager',
      message: 'Your transfer request tr-9001 has been approved.',
      isRead: false,
      createdAt: '2026-09-15T12:00:00.000Z',
      actionUrl: '/transfers/tr-9001',
    };

    expect(item.id).toBe('notif-501');
    expect(item.type).toBe('WORKFLOW_UPDATE');
    expect(item.isRead).toBe(false);
    expect(item.actionUrl).toBe('/transfers/tr-9001');
  });

  it('should validate NotificationsResponse contract', () => {
    const res: NotificationsResponse = {
      unreadCount: 1,
      notifications: [
        {
          id: 'notif-501',
          type: 'WORKFLOW_UPDATE',
          title: 'Review Required',
          message: 'Review pending',
          isRead: false,
          createdAt: '2026-09-15T12:00:00.000Z',
          actionUrl: '/transfers/tr-9001',
        },
      ],
    };

    expect(res.unreadCount).toBe(1);
    expect(res.notifications).toHaveLength(1);
  });

  it('should validate MarkReadResponse contract', () => {
    const res: MarkReadResponse = {
      id: 'notif-501',
      isRead: true,
      readAt: '2026-09-15T12:15:00.000Z',
    };

    expect(res.isRead).toBe(true);
    expect(res.readAt).toBeDefined();
  });

  it('should validate AuditEventItem and AuditTrailResponse contract', () => {
    const event: AuditEventItem = {
      id: 'audit-001',
      action: 'TRANSFER_SUBMITTED',
      actorId: 'emp-001',
      actorRole: 'APPLICANT',
      fromState: null,
      toState: 'SUBMITTED',
      ipAddress: '192.168.1.50',
      timestamp: '2026-09-15T11:30:00.000Z',
      metadata: { proposedDepartmentId: 'dept-102' },
    };

    const trail: AuditTrailResponse = {
      transferId: 'tr-9001',
      auditEvents: [event],
    };

    expect(trail.transferId).toBe('tr-9001');
    expect(trail.auditEvents[0].action).toBe('TRANSFER_SUBMITTED');
    expect(trail.auditEvents[0].ipAddress).toBe('192.168.1.50');
    expect(trail.auditEvents[0].fromState).toBeNull();
  });
});
