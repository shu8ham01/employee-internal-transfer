import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { BottleneckCallout } from '../components/BottleneckCallout';
import { MilestoneTimeline } from '../components/MilestoneTimeline';
import { PendingApprovalsQueue } from '../components/PendingApprovalsQueue';
import { EmptyTransferState } from '../components/EmptyTransferState';

interface TransparencyDashboardPageProps {
  userId?: string;
  isManager?: boolean;
}

export const TransparencyDashboardPage: React.FC<TransparencyDashboardPageProps> = ({
  userId = 'emp-001',
  isManager = false,
}) => {
  const {
    transfers,
    selectedTransferId,
    timeline,
    pendingApprovals,
    isLoading,
    isTimelineLoading,
    error,
    selectTransfer,
  } = useDashboard(userId, isManager);

  if (isLoading) {
    return (
      <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center' }}>
        Loading employee transfer dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '24px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          color: '#fca5a5',
          margin: '24px',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#818cf8',
            }}
          >
            One-Point Employee Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f9fafb', margin: '4px 0 0 0' }}>
            Transfer Transparency Dashboard
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            {transfers.length} Active Transfer{transfers.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Pending Approvals (if manager / HR role) */}
      {isManager && (
        <div style={{ marginBottom: '28px' }}>
          <PendingApprovalsQueue pendingApprovals={pendingApprovals} />
        </div>
      )}

      {/* Empty State */}
      {transfers.length === 0 ? (
        <EmptyTransferState />
      ) : (
        <>
          {/* Active Transfers Selector Tabs (if multiple) */}
          {transfers.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto' }}>
              {transfers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTransfer(t.id)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background:
                      selectedTransferId === t.id
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f9fafb',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  #{t.id} &bull; {t.proposedRole}
                </button>
              ))}
            </div>
          )}

          {/* Timeline & Bottleneck Section */}
          {isTimelineLoading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
              Refreshing transfer milestone tracker...
            </div>
          ) : timeline ? (
            <>
              {/* Bottleneck Indicator */}
              <BottleneckCallout
                bottleneck={timeline.bottleneck}
                currentStage={
                  transfers.find((t) => t.id === selectedTransferId)?.currentStage || 'CURRENT_MANAGER_REVIEW'
                }
              />

              {/* Milestone Progression Tracker */}
              <MilestoneTimeline milestones={timeline.milestones} />
            </>
          ) : null}
        </>
      )}
    </div>
  );
};
