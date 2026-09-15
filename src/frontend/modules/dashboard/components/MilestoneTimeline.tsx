import React from 'react';
import { Milestone } from '../services/dashboard.api';

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  return (
    <div
      style={{
        background: 'rgba(17, 24, 39, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '20px' }}>
        Milestone Progression Tracker
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {milestones.map((m, idx) => {
          let badgeBg = 'rgba(255, 255, 255, 0.05)';
          let badgeBorder = 'rgba(255, 255, 255, 0.1)';
          let badgeColor = '#9ca3af';
          let icon = `${m.step}`;

          if (m.state === 'COMPLETED') {
            badgeBg = 'rgba(16, 185, 129, 0.15)';
            badgeBorder = 'rgba(16, 185, 129, 0.4)';
            badgeColor = '#34d399';
            icon = '✓';
          } else if (m.state === 'IN_PROGRESS') {
            badgeBg = 'rgba(99, 102, 241, 0.2)';
            badgeBorder = 'rgba(99, 102, 241, 0.6)';
            badgeColor = '#a5b4fc';
            icon = '●';
          } else if (m.state === 'REJECTED') {
            badgeBg = 'rgba(239, 68, 68, 0.15)';
            badgeBorder = 'rgba(239, 68, 68, 0.4)';
            badgeColor = '#f87171';
            icon = '✕';
          }

          return (
            <div
              key={m.step}
              style={{
                display: 'flex',
                gap: '16px',
                position: 'relative',
              }}
            >
              {/* Connector line */}
              {idx < milestones.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '17px',
                    top: '36px',
                    bottom: '-16px',
                    width: '2px',
                    background:
                      m.state === 'COMPLETED'
                        ? 'rgba(16, 185, 129, 0.4)'
                        : 'rgba(255, 255, 255, 0.08)',
                  }}
                />
              )}

              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: badgeBg,
                  border: `2px solid ${badgeBorder}`,
                  color: badgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {icon}
              </div>

              <div
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#f9fafb' }}>
                    {m.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: badgeBg,
                      color: badgeColor,
                      border: `1px solid ${badgeBorder}`,
                      textTransform: 'uppercase',
                    }}
                  >
                    {m.state}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.8125rem', color: '#9ca3af' }}>
                  {m.actor && <span>Owner: <strong style={{ color: '#d1d5db' }}>{m.actor}</strong></span>}
                  {m.completedAt ? (
                    <span style={{ color: '#34d399' }}>Completed: {new Date(m.completedAt).toLocaleDateString()}</span>
                  ) : m.state === 'IN_PROGRESS' ? (
                    <span style={{ color: '#a5b4fc' }}>In Progress</span>
                  ) : (
                    <span>Awaiting prerequisite stages</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
