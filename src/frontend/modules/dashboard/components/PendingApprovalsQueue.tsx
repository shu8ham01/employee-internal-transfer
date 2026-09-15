import React from 'react';
import { PendingApproval } from '../services/dashboard.api';

interface PendingApprovalsQueueProps {
  pendingApprovals: PendingApproval[];
}

export const PendingApprovalsQueue: React.FC<PendingApprovalsQueueProps> = ({
  pendingApprovals,
}) => {
  if (pendingApprovals.length === 0) {
    return (
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(12px)',
          textAlign: 'center',
          color: '#9ca3af',
        }}
      >
        ✓ All pending approval actions are currently up to date.
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f3f4f6', margin: 0 }}>
          Your Pending Approval Actions
        </h3>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.4)',
          }}
        >
          {pendingApprovals.length} Pending Action{pendingApprovals.length > 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pendingApprovals.map((item) => (
          <div
            key={item.transferId}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ color: '#f9fafb', fontSize: '0.9375rem' }}>{item.applicantName}</strong>
                <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>({item.applicantRole})</span>
                <span style={{ color: '#6366f1' }}>➔</span>
                <strong style={{ color: '#818cf8', fontSize: '0.9375rem' }}>{item.targetRole}</strong>
                <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>&bull; {item.targetDepartment}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                Submitted on {new Date(item.submittedDate).toLocaleDateString()} &bull; Transfer #{item.transferId}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: item.slaRemainingHours < 24 ? '#f87171' : '#34d399',
                }}
              >
                SLA: {item.slaRemainingHours}h remaining
              </span>
              <button
                type="button"
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Review &amp; Action
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
