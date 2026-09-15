/**
 * Audit Trail Drawer Component
 * Displays the complete, immutable audit trail for a transfer request.
 */

import React from 'react';
import { AuditEventItem } from '../services/notifications.api';

export interface AuditTrailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transferId: string;
  auditEvents: AuditEventItem[];
}

export const AuditTrailDrawer: React.FC<AuditTrailDrawerProps> = ({
  isOpen,
  onClose,
  transferId,
  auditEvents,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="audit-drawer-overlay"
      data-testid="audit-drawer-overlay"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 2000,
      }}
    >
      <div
        className="audit-drawer-content"
        data-testid="audit-drawer-content"
        style={{
          width: '450px',
          maxWidth: '90vw',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#1a202c' }}>Audit Trail</h3>
            <span style={{ fontSize: '12px', color: '#718096' }}>Transfer ID: {transferId}</span>
          </div>
          <button
            type="button"
            data-testid="close-audit-drawer-btn"
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Close
          </button>
        </div>

        {auditEvents.length === 0 ? (
          <p style={{ color: '#718096', textAlign: 'center', margin: '40px 0' }}>
            No audit log records found for this transfer.
          </p>
        ) : (
          <div className="audit-timeline" style={{ position: 'relative', paddingLeft: '20px' }}>
            {auditEvents.map((event, idx) => (
              <div
                key={event.id || idx}
                data-testid={`audit-event-${event.id || idx}`}
                style={{
                  position: 'relative',
                  marginBottom: '20px',
                  borderLeft: '2px solid #cbd5e0',
                  paddingLeft: '16px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '-25px',
                    top: '0',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#3182ce',
                    border: '2px solid #ffffff',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px', color: '#2b6cb0' }}>{event.action}</strong>
                  <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#4a5568', marginTop: '4px' }}>
                  <span>Actor: <strong>{event.actorId}</strong> ({event.actorRole})</span>
                </div>
                {event.fromState || event.toState ? (
                  <div style={{ fontSize: '11px', color: '#718096', marginTop: '2px' }}>
                    State: <code>{event.fromState || 'NONE'}</code> ➔ <code>{event.toState}</code>
                  </div>
                ) : null}
                <div style={{ fontSize: '11px', color: '#a0aec0', marginTop: '2px' }}>
                  IP: {event.ipAddress}
                </div>
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <pre
                    style={{
                      backgroundColor: '#f7fafc',
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#4a5568',
                      marginTop: '6px',
                      overflowX: 'auto',
                    }}
                  >
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
