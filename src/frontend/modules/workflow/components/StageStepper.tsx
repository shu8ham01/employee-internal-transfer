import React from 'react';
import { WorkflowState } from '../services/workflow.api';

interface StageStepperProps {
  workflow: WorkflowState;
}

interface StepDefinition {
  key: string;
  label: string;
  subtitle: string;
}

const STEPS: StepDefinition[] = [
  { key: 'CURRENT_MANAGER_REVIEW', label: 'Current Manager', subtitle: 'Release & Handover' },
  { key: 'HIRING_MANAGER_REVIEW', label: 'Hiring Manager', subtitle: 'Role Fit & Team Acceptance' },
  { key: 'HR_VALIDATION', label: 'HR Administrator', subtitle: 'Policy & Compensation Check' },
  { key: 'FULFILLMENT', label: 'Fulfillment', subtitle: 'Downstream Provisioning' },
];

export const StageStepper: React.FC<StageStepperProps> = ({ workflow }) => {
  const currentStageName = workflow.currentStage?.stageName;
  const isTerminated = workflow.status === 'REJECTED';
  const isApproved = workflow.status === 'APPROVED' || workflow.status === 'COMPLETED';

  const getStepStatus = (index: number) => {
    const activeIndex = STEPS.findIndex((s) => s.key === currentStageName);
    if (isTerminated) {
      if (index < activeIndex) return 'completed';
      if (index === activeIndex) return 'rejected';
      return 'pending';
    }
    if (isApproved) return 'completed';
    if (index < activeIndex) return 'completed';
    if (index === activeIndex) return 'active';
    return 'pending';
  };

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
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f3f4f6', margin: 0 }}>
          Workflow Approval Lifecycle
        </h3>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 10px',
            borderRadius: '9999px',
            background:
              workflow.status === 'APPROVED'
                ? 'rgba(16, 185, 129, 0.15)'
                : workflow.status === 'REJECTED'
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(99, 102, 241, 0.15)',
            color:
              workflow.status === 'APPROVED'
                ? '#34d399'
                : workflow.status === 'REJECTED'
                ? '#f87171'
                : '#818cf8',
            border: '1px solid currentColor',
          }}
        >
          {workflow.status}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {STEPS.map((step, idx) => {
          const status = getStepStatus(idx);
          const isCurrent = workflow.currentStage?.stageName === step.key;
          const assigned = isCurrent ? workflow.currentStage?.assignedReviewer : undefined;

          let badgeBg = 'rgba(255, 255, 255, 0.05)';
          let badgeBorder = 'rgba(255, 255, 255, 0.1)';
          let badgeColor = '#9ca3af';
          let icon = `${idx + 1}`;

          if (status === 'completed') {
            badgeBg = 'rgba(16, 185, 129, 0.15)';
            badgeBorder = 'rgba(16, 185, 129, 0.4)';
            badgeColor = '#34d399';
            icon = '✓';
          } else if (status === 'active') {
            badgeBg = 'rgba(99, 102, 241, 0.2)';
            badgeBorder = 'rgba(99, 102, 241, 0.6)';
            badgeColor = '#a5b4fc';
            icon = '●';
          } else if (status === 'rejected') {
            badgeBg = 'rgba(239, 68, 68, 0.15)';
            badgeBorder = 'rgba(239, 68, 68, 0.4)';
            badgeColor = '#f87171';
            icon = '✕';
          }

          return (
            <div
              key={step.key}
              style={{
                flex: '1 1 200px',
                background: badgeBg,
                border: `1px solid ${badgeBorder}`,
                borderRadius: '12px',
                padding: '16px',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: badgeBorder,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: badgeColor,
                  }}
                >
                  {icon}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f9fafb' }}>
                  {step.label}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{step.subtitle}</div>
              {assigned && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Reviewer: <strong>{assigned.name}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
