import React, { useState } from 'react';
import { OperationalTask, UpdateTaskPayload } from '../services/operations.api';

interface OperationalTaskCardProps {
  task: OperationalTask;
  isUpdating: boolean;
  onUpdate: (taskId: string, payload: UpdateTaskPayload) => Promise<boolean>;
}

export const OperationalTaskCard: React.FC<OperationalTaskCardProps> = ({
  task,
  isUpdating,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [completedBy, setCompletedBy] = useState(task.completedBy || '');

  const handleSaveCompleted = async () => {
    const ok = await onUpdate(task.id, {
      status: 'COMPLETED',
      notes: notes.trim() || undefined,
      completedBy: completedBy.trim() || 'operator@intglobal.com',
    });
    if (ok) setIsEditing(false);
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'IT':
        return { color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.35)' };
      case 'FACILITIES':
        return { color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.35)' };
      case 'PAYROLL':
        return { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' };
      default:
        return { color: '#9ca3af', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  const theme = getCategoryTheme(task.category);
  const isDone = task.status === 'COMPLETED';

  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '16px',
        padding: '20px 24px',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: theme.bg,
                color: theme.color,
                border: `1px solid ${theme.border}`,
              }}
            >
              {task.category}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Team: {task.assignedTeam}</span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f9fafb', margin: 0 }}>
            {task.title}
          </h4>
        </div>

        <div>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isDone ? '#34d399' : '#fbbf24',
              border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            }}
          >
            {task.status}
          </span>
        </div>
      </div>

      {task.notes && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            color: '#cbd5e1',
          }}
        >
          <strong>Operator Note:</strong> &ldquo;{task.notes}&rdquo;
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
          {task.completedAt ? (
            <span>Completed on {new Date(task.completedAt).toLocaleString()} by {task.completedBy}</span>
          ) : (
            <span>Awaiting fulfillment action</span>
          )}
        </div>

        {!isDone && (
          <div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#6ee7b7',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✓ Mark Completed
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', minWidth: '280px', marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="Operator notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f9fafb',
                    fontSize: '0.8125rem',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleSaveCompleted}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#d1d5db',
                      border: 'none',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
