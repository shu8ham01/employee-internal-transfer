/**
 * Notifications & Audit Frontend API Client
 * Spec: .ai-context/specs/notifications-and-audit.spec.md
 */

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  actionUrl: string;
}

export interface NotificationsResponse {
  unreadCount: number;
  notifications: NotificationItem[];
}

export interface MarkReadResponse {
  id: string;
  isRead: boolean;
  readAt: string;
}

export interface AuditEventItem {
  id: string;
  action: string;
  actorId: string;
  actorRole: string;
  fromState: string | null;
  toState: string | null;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AuditTrailResponse {
  transferId: string;
  auditEvents: AuditEventItem[];
}

export const notificationsApi = {
  async fetchNotifications(userId?: string): Promise<NotificationsResponse> {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['x-user-id'] = userId;
    }

    const res = await fetch('/api/v1/notifications', { headers });
    if (!res.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return res.json() as Promise<NotificationsResponse>;
  },

  async markAsRead(notificationId: string): Promise<MarkReadResponse> {
    const res = await fetch(`/api/v1/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) {
      throw new Error('Failed to mark notification as read');
    }
    return res.json() as Promise<MarkReadResponse>;
  },

  async fetchAuditTrail(transferId: string): Promise<AuditTrailResponse> {
    const res = await fetch(`/api/v1/transfers/${transferId}/audit-trail`);
    if (!res.ok) {
      throw new Error(`Failed to fetch audit trail for transfer ${transferId}`);
    }
    return res.json() as Promise<AuditTrailResponse>;
  },
};
