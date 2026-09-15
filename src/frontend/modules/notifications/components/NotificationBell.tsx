/**
 * Notification Bell Component
 * Displays bell icon with unread count badge and popover dropdown.
 */

import React, { useState } from 'react';
import { NotificationItem } from '../services/notifications.api';

export interface NotificationBellProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notification-bell-container" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="notification-bell-trigger"
        aria-label={`Notifications (${unreadCount} unread)`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: '1px solid #e2e8f0',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <span style={{ fontSize: '18px' }} role="img" aria-hidden="true">
          🔔
        </span>
        {unreadCount > 0 && (
          <span
            className="notification-badge"
            data-testid="unread-badge"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#e53e3e',
              color: '#ffffff',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              lineHeight: 1,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown"
          data-testid="notification-dropdown"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            width: '340px',
            maxHeight: '400px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e0',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            padding: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '8px',
              marginBottom: '8px',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Notifications</h4>
            <span style={{ fontSize: '12px', color: '#718096' }}>{unreadCount} unread</span>
          </div>

          {notifications.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#a0aec0', textAlign: 'center', margin: '20px 0' }}>
              No notifications yet.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {notifications.map((item) => (
                <li
                  key={item.id}
                  data-testid={`notification-item-${item.id}`}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    backgroundColor: item.isRead ? '#f7fafc' : '#ebf8ff',
                    borderLeft: item.isRead ? '3px solid #cbd5e0' : '3px solid #3182ce',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '13px', color: '#2d3748' }}>{item.title}</strong>
                    {!item.isRead && (
                      <button
                        type="button"
                        data-testid={`mark-read-btn-${item.id}`}
                        onClick={() => onMarkAsRead(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#3182ce',
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: 0,
                          marginLeft: '6px',
                        }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#4a5568', margin: '4px 0 0 0' }}>{item.message}</p>
                  <small style={{ fontSize: '10px', color: '#a0aec0' }}>
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
