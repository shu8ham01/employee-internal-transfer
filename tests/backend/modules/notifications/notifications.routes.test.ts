/**
 * Route Integration Tests for Audit and Notifications
 */

import request from 'supertest';
import { createApp } from '../../../../src/backend/app/server';
import { InMemoryAuditRepository } from '../../../../src/backend/modules/audit/repositories/audit.repository';
import { InMemoryNotificationRepository } from '../../../../src/backend/modules/notifications/repositories/notification.repository';

describe('Notifications & Audit HTTP Routes', () => {
  let auditRepo: InMemoryAuditRepository;
  let notifRepo: InMemoryNotificationRepository;
  let app: any;

  beforeEach(async () => {
    auditRepo = new InMemoryAuditRepository();
    notifRepo = new InMemoryNotificationRepository();
    app = createApp(undefined, undefined, undefined, undefined, auditRepo, notifRepo);

    // Seed an audit event
    await auditRepo.create({
      transferId: 'tr-9001',
      action: 'TRANSFER_SUBMITTED',
      actorId: 'emp-001',
      actorRole: 'APPLICANT',
      fromState: null,
      toState: 'SUBMITTED',
      ipAddress: '192.168.1.50',
      metadata: { proposedDepartmentId: 'dept-102', proposedRoleId: 'role-202' },
    });

    // Seed a notification
    await notifRepo.create({
      recipientId: 'emp-001',
      type: 'WORKFLOW_UPDATE',
      title: 'Transfer Request Approved by Current Manager',
      message: 'Your transfer request tr-9001 has been approved.',
      actionUrl: '/transfers/tr-9001',
    });
  });

  describe('GET /api/v1/transfers/:id/audit-trail', () => {
    it('should return 200 OK with transfer audit trail', async () => {
      const res = await request(app)
        .get('/api/v1/transfers/tr-9001/audit-trail')
        .expect(200);

      expect(res.body.transferId).toBe('tr-9001');
      expect(Array.isArray(res.body.auditEvents)).toBe(true);
      expect(res.body.auditEvents).toHaveLength(1);
      expect(res.body.auditEvents[0].action).toBe('TRANSFER_SUBMITTED');
    });

    it('should return empty audit events list for transfer with no logs', async () => {
      const res = await request(app)
        .get('/api/v1/transfers/tr-unknown/audit-trail')
        .expect(200);

      expect(res.body.transferId).toBe('tr-unknown');
      expect(res.body.auditEvents).toEqual([]);
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('should return 200 OK with notifications and unread count', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('x-user-id', 'emp-001')
        .expect(200);

      expect(res.body.unreadCount).toBe(1);
      expect(Array.isArray(res.body.notifications)).toBe(true);
      expect(res.body.notifications[0].title).toBe('Transfer Request Approved by Current Manager');
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('should mark notification as read and return 200 OK', async () => {
      const listRes = await request(app)
        .get('/api/v1/notifications')
        .set('x-user-id', 'emp-001');

      const notifId = listRes.body.notifications[0].id;

      const res = await request(app)
        .patch(`/api/v1/notifications/${notifId}/read`)
        .expect(200);

      expect(res.body.id).toBe(notifId);
      expect(res.body.isRead).toBe(true);
      expect(res.body.readAt).toBeDefined();

      // Check unread count is now 0
      const afterRes = await request(app)
        .get('/api/v1/notifications')
        .set('x-user-id', 'emp-001');

      expect(afterRes.body.unreadCount).toBe(0);
    });

    it('should return 404 when notification does not exist', async () => {
      const res = await request(app)
        .patch('/api/v1/notifications/notif-9999/read')
        .expect(404);

      expect(res.body.error).toBe('Notification not found');
    });
  });
});
