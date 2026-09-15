import React, { useState } from 'react';
import { SubmitDecisionPayload } from '../services/workflow.api';

interface DecisionActionPanelProps {
  currentStageName: string;
  isSubmitting: boolean;
  onSubmit: (payload: SubmitDecisionPayload) => Promise<boolean>;
}

export const DecisionActionPanel: React.FC<DecisionActionPanelProps> = ({
  currentStageName,
  isSubmitting,
  onSubmit,
}) => {
  const [selectedAction, setSelectedAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_REVISION'>('APPROVE');
  const [remarks, setRemarks] = useState('');
  const [targetReleaseDate, setTargetReleaseDate] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!remarks.trim()) {
      setLocalError('Remarks are mandatory for all workflow decisions');
      return;
    }

    const payload: SubmitDecisionPayload = {
      action: selectedAction,
      remarks: remarks.trim(),
      ...(targetReleaseDate ? { targetReleaseDate } : {}),
    };

    const ok = await onSubmit(payload);
    if (ok) {
      setRemarks('');
      setTargetReleaseDate('');
    }
  };

  const isCurrentManagerStage = currentStageName === 'CURRENT_MANAGER_REVIEW';

  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        marginTop: '24px',
      }}
    >
      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f9fafb', marginBottom: '8px' }}>
        Reviewer Decision Panel
      </h3>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '20px' }}>
        Submit your formal decision for this stage. Decision history and audit trail are immutable.
      </p>

      {localError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}
        >
          {localError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '8px' }}>
            Decision Action
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setSelectedAction('APPROVE')}
              style={{
                flex: '1 1 120px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: selectedAction === 'APPROVE' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                background: selectedAction === 'APPROVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedAction === 'APPROVE' ? '#34d399' : '#9ca3af',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✓ Approve
            </button>
            <button
              type="button"
              onClick={() => setSelectedAction('REQUEST_REVISION')}
              style={{
                flex: '1 1 120px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: selectedAction === 'REQUEST_REVISION' ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                background: selectedAction === 'REQUEST_REVISION' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedAction === 'REQUEST_REVISION' ? '#fbbf24' : '#9ca3af',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ↺ Request Revision
            </button>
            <button
              type="button"
              onClick={() => setSelectedAction('REJECT')}
              style={{
                flex: '1 1 120px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: selectedAction === 'REJECT' ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                background: selectedAction === 'REJECT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedAction === 'REJECT' ? '#f87171' : '#9ca3af',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ✕ Reject
            </button>
          </div>
        </div>

        {isCurrentManagerStage && selectedAction === 'APPROVE' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
              Target Release Date
            </label>
            <input
              type="date"
              value={targetReleaseDate}
              onChange={(e) => setTargetReleaseDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f9fafb',
                outline: 'none',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#d1d5db', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
            Decision Remarks (Mandatory)
          </label>
          <textarea
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Provide justification, release timeline, or required revision details..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f9fafb',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: '8px',
            background:
              selectedAction === 'APPROVE'
                ? '#10b981'
                : selectedAction === 'REJECT'
                ? '#ef4444'
                : '#f59e0b',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9375rem',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {isSubmitting ? 'Submitting Decision...' : `Confirm ${selectedAction}`}
        </button>
      </form>
    </div>
  );
};
