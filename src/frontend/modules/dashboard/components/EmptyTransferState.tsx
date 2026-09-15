import React from 'react';

export const EmptyTransferState: React.FC = () => {
  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px dashed rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '48px 24px',
        textAlign: 'center',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#818cf8',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginBottom: '16px',
        }}
      >
        📄
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f9fafb', marginBottom: '8px' }}>
        No Active Transfer Requests
      </h3>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 24px auto' }}>
        You currently have no internal transfer applications in progress. Explore open department roles and submit a transfer request when you are ready.
      </p>
      <button
        type="button"
        style={{
          padding: '10px 20px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.875rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
        }}
      >
        + Initiate New Transfer
      </button>
    </div>
  );
};
