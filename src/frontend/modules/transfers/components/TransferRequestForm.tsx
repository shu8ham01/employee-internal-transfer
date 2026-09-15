import React, { useState } from 'react';
import { LookupData, CreateTransferPayload } from '../services/transfer.api';

interface TransferRequestFormProps {
  lookupData: LookupData;
  currentDepartmentId: string;
  currentRoleId: string;
  isSubmitting: boolean;
  onSubmit: (payload: CreateTransferPayload) => Promise<boolean>;
}

export const TransferRequestForm: React.FC<TransferRequestFormProps> = ({
  lookupData,
  currentDepartmentId,
  currentRoleId,
  isSubmitting,
  onSubmit,
}) => {
  const [departmentId, setDepartmentId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reason, setReason] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  // Filter roles based on selected department if applicable
  const availableRoles = departmentId
    ? lookupData.roles.filter((r) => r.departmentId === departmentId)
    : lookupData.roles;

  // Minimum date is tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    if (!departmentId || !locationId || !roleId || !effectiveDate) {
      setClientError('Please fill in all mandatory fields.');
      return;
    }

    if (departmentId === currentDepartmentId && roleId === currentRoleId) {
      setClientError('Proposed department and role cannot match your current active department and role.');
      return;
    }

    const payload: CreateTransferPayload = {
      proposedDepartmentId: departmentId,
      proposedLocationId: locationId,
      proposedRoleId: roleId,
      effectiveDate: new Date(effectiveDate).toISOString(),
      transferReason: reason.trim() || undefined,
      supportingDocumentUrls: documentUrl.trim() ? [documentUrl.trim()] : undefined,
    };

    await onSubmit(payload);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(15, 23, 42, 0.6)',
    color: '#f9fafb',
    fontSize: '0.875rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: '6px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#9ca3af',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '32px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f9fafb', marginBottom: '20px' }}>
        Configure Internal Transfer Request
      </h3>

      {clientError && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '20px',
          }}
        >
          {clientError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={labelStyle}>
            Proposed Target Department <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            style={inputStyle}
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setRoleId('');
            }}
            required
          >
            <option value="">Select target department...</option>
            {lookupData.departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>
            Proposed Target Location <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            style={inputStyle}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
          >
            <option value="">Select target location...</option>
            {lookupData.locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>
            Proposed Target Role <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            style={inputStyle}
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            required
          >
            <option value="">Select proposed role...</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>
            Requested Effective Date <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="date"
            style={inputStyle}
            min={minDateStr}
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={labelStyle}>Transfer Reason / Justification</label>
          <span style={{ fontSize: '0.75rem', color: reason.length > 1000 ? '#ef4444' : '#6b7280' }}>
            {reason.length} / 1000
          </span>
        </div>
        <textarea
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          placeholder="Provide detailed justification for your internal mobility request..."
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '28px' }}>
        <label style={labelStyle}>Supporting Document URL (Optional)</label>
        <input
          type="url"
          style={inputStyle}
          placeholder="https://storage.internal.intglobal.com/docs/..."
          value={documentUrl}
          onChange={(e) => setDocumentUrl(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '14px 28px',
          borderRadius: '10px',
          border: 'none',
          background: isSubmitting ? '#4b5563' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.9375rem',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
          transition: 'all 0.2s',
        }}
      >
        {isSubmitting ? 'Submitting Request...' : 'Submit Transfer Request'}
      </button>
    </form>
  );
};
