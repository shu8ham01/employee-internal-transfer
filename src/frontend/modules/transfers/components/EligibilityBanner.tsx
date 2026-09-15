import React from 'react';
import { EligibilityData } from '../services/transfer.api';

interface EligibilityBannerProps {
  data: EligibilityData;
}

export const EligibilityBanner: React.FC<EligibilityBannerProps> = ({ data }) => {
  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#818cf8',
            }}
          >
            Current Employee Profile
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f9fafb', marginTop: '4px' }}>
            {data.currentRole.title} &bull; {data.currentDepartment.name}
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>
            Location: <strong style={{ color: '#e5e7eb' }}>{data.currentLocation.name}</strong> &bull; Tenure: <strong style={{ color: '#e5e7eb' }}>{data.tenureMonths} months</strong>
          </p>
        </div>

        <div>
          {data.isEligible ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              ✓ Eligible for Transfer
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              ⚠ Transfer In Progress ({data.activeTransferId})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
