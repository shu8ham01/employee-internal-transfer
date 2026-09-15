import React from 'react';
import { useOperations } from '../hooks/useOperations';
import { OperationalTaskCard } from '../components/OperationalTaskCard';
import { CompletionGateBanner } from '../components/CompletionGateBanner';

interface OperationalFulfillmentPageProps {
  transferId: string;
  userRole?: string;
}

export const OperationalFulfillmentPage: React.FC<OperationalFulfillmentPageProps> = ({
  transferId = 'tr-9001',
  userRole = 'HR_ADMIN',
}) => {
  const {
    tasks,
    isAllCompleted,
    isLoading,
    isUpdating,
    isClosing,
    error,
    closureResult,
    updateTask,
    finalizeTransfer,
  } = useOperations(transferId);

  if (isLoading) {
    return (
      <div style={{ padding: '48px', color: '#9ca3af', textAlign: 'center' }}>
        Loading operational fulfillment tasks...
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#818cf8',
            }}
          >
            Transfer #{transferId}
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
            Stage: FULFILLMENT
          </span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f9fafb', margin: 0 }}>
          Downstream Operational Task Fulfillment
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9375rem', marginTop: '6px' }}>
          Coordinate IT provisioning, Facilities site badge allocation, and Payroll profile indexing.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            color: '#fca5a5',
            marginBottom: '24px',
          }}
        >
          {error}
        </div>
      )}

      {closureResult && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            color: '#6ee7b7',
            marginBottom: '24px',
          }}
        >
          ✓ <strong>{closureResult.message}</strong> (Closed at {new Date(closureResult.completedAt).toLocaleString()})
        </div>
      )}

      {/* Completion Gate Banner */}
      <CompletionGateBanner
        completedCount={completedCount}
        totalCount={tasks.length}
        isAllCompleted={isAllCompleted}
        isClosing={isClosing}
        onFinalize={() => finalizeTransfer(userRole)}
      />

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tasks.map((task) => (
          <OperationalTaskCard
            key={task.id}
            task={task}
            isUpdating={isUpdating}
            onUpdate={updateTask}
          />
        ))}
      </div>
    </div>
  );
};
