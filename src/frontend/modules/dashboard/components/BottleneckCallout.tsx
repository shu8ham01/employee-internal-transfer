import React from 'react';
import { Bottleneck } from '../services/dashboard.api';

interface BottleneckCalloutProps {
  bottleneck: Bottleneck;
  currentStage: string;
}

export const BottleneckCallout: React.FC<BottleneckCalloutProps> = ({
  bottleneck,
  currentStage,
}) => {
  const isOverdue = bottleneck.isBlocked || bottleneck.elapsedHours >= bottleneck.slaHours;

  return (
    <div
      style={{
        background: isOverdue ? 'rgba(239, 68, 68, 0.12)' : 'rgba(99, 102, 241, 0.1)',
        border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`,
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '24px',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isOverdue ? '#f87171' : '#a5b4fc',
            }}
          >
            {isOverdue ? '⚠️ SLA Warning: Review Overdue' : 'ℹ️ Action Pending'}
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#d1d5db',
            }}
          >
            Stage: {currentStage}
          </span>
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9fafb', margin: 0 }}>
          Pending with {bottleneck.pendingReviewerName} ({bottleneck.pendingReviewerRole})
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
          Pending since {new Date(bottleneck.pendingSince).toLocaleDateString()} &bull; Elapsed:{' '}
          <strong style={{ color: isOverdue ? '#fca5a5' : '#e0e7ff' }}>
            {bottleneck.elapsedHours} hours
          </strong>{' '}
          (SLA Target: {bottleneck.slaHours}h)
        </p>
      </div>

      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            background: isOverdue ? 'rgba(239, 68, 68, 0.25)' : 'rgba(99, 102, 241, 0.2)',
            color: isOverdue ? '#fca5a5' : '#c7d2fe',
            border: `1px solid ${isOverdue ? 'rgba(239, 68, 68, 0.5)' : 'rgba(99, 102, 241, 0.5)'}`,
          }}
        >
          {isOverdue ? 'Action Required: Escalated' : 'Within Normal SLA'}
        </span>
      </div>
    </div>
  );
};
