import React from 'react';

interface CompletionGateBannerProps {
  completedCount: number;
  totalCount: number;
  isAllCompleted: boolean;
  isClosing: boolean;
  onFinalize: () => Promise<boolean>;
}

export const CompletionGateBanner: React.FC<CompletionGateBannerProps> = ({
  completedCount,
  totalCount,
  isAllCompleted,
  isClosing,
  onFinalize,
}) => {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      style={{
        background: isAllCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.1)',
        border: `1px solid ${isAllCompleted ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isAllCompleted ? '#34d399' : '#fbbf24',
            }}
          >
            {isAllCompleted ? '✓ Fulfillment Verification Complete' : '⏳ Downstream Fulfillment In Progress'}
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f9fafb', margin: '4px 0 0 0' }}>
            Operational Closure Gate ({completedCount} of {totalCount} Tasks Completed)
          </h3>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
            {isAllCompleted
              ? 'All IT, Facilities, and Payroll tasks are verified. HR Administrator may now execute final transfer closure.'
              : 'Transfer closure is strictly locked until IT access, Facilities seating, and Payroll updates are 100% completed.'}
          </p>
        </div>

        <div>
          <button
            type="button"
            disabled={!isAllCompleted || isClosing}
            onClick={() => onFinalize()}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: isAllCompleted
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(255, 255, 255, 0.08)',
              color: isAllCompleted ? '#ffffff' : '#6b7280',
              fontWeight: 700,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: isAllCompleted ? (isClosing ? 'not-allowed' : 'pointer') : 'not-allowed',
              boxShadow: isAllCompleted ? '0 4px 16px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {isClosing ? 'Executing Final Closure...' : 'Finalize & Close Transfer'}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            background: isAllCompleted ? '#10b981' : '#f59e0b',
            borderRadius: '9999px',
            transition: 'width 0.4s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};
