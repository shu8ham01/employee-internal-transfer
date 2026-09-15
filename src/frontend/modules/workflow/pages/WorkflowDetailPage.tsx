import React from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { StageStepper } from '../components/StageStepper';
import { DecisionActionPanel } from '../components/DecisionActionPanel';

interface WorkflowDetailPageProps {
  transferId: string;
  currentUserId?: string;
}

export const WorkflowDetailPage: React.FC<WorkflowDetailPageProps> = ({
  transferId,
  currentUserId = 'mgr-101',
}) => {
  const {
    workflowState,
    isLoading,
    isSubmitting,
    error,
    lastDecisionResult,
    canAct,
    submitDecision,
  } = useWorkflow(transferId, currentUserId);

  if (isLoading) {
    return (
      <div style={{ padding: '40px', color: '#9ca3af', textAlign: 'center' }}>
        Loading workflow execution state...
      </div>
    );
  }

  if (error || !workflowState) {
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
        {error || 'Unable to load workflow details'}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#818cf8',
            }}
          >
            Transfer #{workflowState.transferId}
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
            Active Stage: {workflowState.currentStage?.stageName || 'None'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f9fafb', margin: 0 }}>
          Transfer Workflow Orchestration
        </h1>
      </div>

      {lastDecisionResult && (
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
          ✓ Decision recorded: <strong>{lastDecisionResult.decision.action}</strong>. Workflow status: <strong>{lastDecisionResult.status}</strong>
        </div>
      )}

      {/* Progress Stepper */}
      <StageStepper workflow={workflowState} />

      {/* Decision Action Panel (if reviewer authorized) */}
      {canAct && workflowState.currentStage && (
        <DecisionActionPanel
          currentStageName={workflowState.currentStage.stageName}
          isSubmitting={isSubmitting}
          onSubmit={submitDecision}
        />
      )}

      {/* Audit History Timeline */}
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '28px',
          backdropFilter: 'blur(12px)',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '16px' }}>
          Decision History &amp; Audit Trail
        </h3>
        {workflowState.history.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No recorded history yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {workflowState.history.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: '16px',
                  borderBottom:
                    idx < workflowState.history.length - 1
                      ? '1px solid rgba(255, 255, 255, 0.06)'
                      : 'none',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f9fafb' }}>
                      {item.action} &bull; <span style={{ color: '#9ca3af' }}>{item.stage}</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '4px' }}>
                    Actor: <strong>{item.actor}</strong>
                  </div>
                  {item.remarks && (
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '8px 12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        color: '#d1d5db',
                      }}
                    >
                      &ldquo;{item.remarks}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
