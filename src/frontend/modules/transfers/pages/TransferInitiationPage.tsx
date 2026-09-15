import React from 'react';
import { useTransferInitiation } from '../hooks/useTransferInitiation';
import { EligibilityBanner } from '../components/EligibilityBanner';
import { TransferRequestForm } from '../components/TransferRequestForm';

export const TransferInitiationPage: React.FC = () => {
  const {
    eligibility,
    lookupData,
    isLoading,
    isSubmitting,
    error,
    submittedTransfer,
    submitTransfer,
    reload,
  } = useTransferInitiation();

  if (isLoading) {
    return (
      <div style={{ padding: '40px', color: '#9ca3af', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Loading transfer eligibility profile and enterprise lookup data...</p>
      </div>
    );
  }

  if (error && !eligibility) {
    return (
      <div style={{ padding: '40px', color: '#fca5a5', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>Error: {error}</p>
        <button
          onClick={reload}
          style={{
            marginTop: '16px',
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: '#6366f1',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '32px 20px',
        fontFamily: "'Inter', sans-serif",
        color: '#f9fafb',
      }}
    >
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Employee Internal Transfer Portal
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.9375rem', marginTop: '4px' }}>
          Discover career opportunities, verify transfer eligibility, and initiate internal mobility requests.
        </p>
      </div>

      {eligibility && <EligibilityBanner data={eligibility} />}

      {submittedTransfer ? (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 16px auto',
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f9fafb' }}>
            Transfer Request Submitted Successfully
          </h2>
          <p style={{ color: '#9ca3af', marginTop: '8px' }}>
            Your transfer tracking ID is <strong style={{ color: '#818cf8', fontFamily: 'monospace' }}>{submittedTransfer.id}</strong>.
          </p>
          <p style={{ color: '#9ca3af', marginTop: '4px' }}>
            Current Workflow Stage: <strong style={{ color: '#10b981' }}>{submittedTransfer.currentStage}</strong>
          </p>
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={reload}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#6366f1',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Dashboard Status
            </button>
          </div>
        </div>
      ) : eligibility && !eligibility.isEligible ? (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fca5a5' }}>
            Active Transfer Request in Progress
          </h3>
          <p style={{ color: '#9ca3af', marginTop: '8px' }}>
            You cannot initiate a new transfer request because an active request (<span style={{ fontFamily: 'monospace' }}>{eligibility.activeTransferId}</span>) is currently pending review.
          </p>
        </div>
      ) : lookupData && eligibility ? (
        <TransferRequestForm
          lookupData={lookupData}
          currentDepartmentId={eligibility.currentDepartment.id}
          currentRoleId={eligibility.currentRole.id}
          isSubmitting={isSubmitting}
          onSubmit={submitTransfer}
        />
      ) : null}
    </div>
  );
};
