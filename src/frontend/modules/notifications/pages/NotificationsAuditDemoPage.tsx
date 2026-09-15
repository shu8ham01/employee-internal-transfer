/**
 * Notifications & Audit Demo Page
 */

import React, { useState } from 'react';
import { NotificationBell } from '../components/NotificationBell';
import { AuditTrailDrawer } from '../components/AuditTrailDrawer';
import { useNotifications } from '../hooks/useNotifications';
import { notificationsApi, AuditEventItem } from '../services/notifications.api';

export const NotificationsAuditDemoPage: React.FC<{ initialTransferId?: string }> = ({
  initialTransferId = 'tr-9001',
}) => {
  const { notifications, unreadCount, markAsRead } = useNotifications('emp-001');
  const [transferId, setTransferId] = useState(initialTransferId);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const openAuditDrawer = async () => {
    try {
      setLoadingAudit(true);
      const res = await notificationsApi.fetchAuditTrail(transferId);
      setAuditEvents(res.auditEvents);
      setIsDrawerOpen(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoadingAudit(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #edf2f7',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1a202c' }}>
            Notifications & Audit Logging Demo
          </h1>
          <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '14px' }}>
            BRD-005: Automated Notifications & Immutable Audit Trail
          </p>
        </div>
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
        />
      </header>

      <section style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>Transfer Audit Inspection</h2>
        <p style={{ fontSize: '14px', color: '#4a5568' }}>
          Inspect the immutable audit log trail for an active transfer request.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
          <input
            type="text"
            value={transferId}
            onChange={(e) => setTransferId(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e0',
              borderRadius: '6px',
              fontSize: '14px',
            }}
            placeholder="Transfer ID"
          />
          <button
            type="button"
            data-testid="view-audit-trail-btn"
            onClick={openAuditDrawer}
            disabled={loadingAudit}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {loadingAudit ? 'Loading...' : 'View Audit Trail'}
          </button>
        </div>
      </section>

      <AuditTrailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transferId={transferId}
        auditEvents={auditEvents}
      />
    </div>
  );
};
