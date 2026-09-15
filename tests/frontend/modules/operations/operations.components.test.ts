/**
 * Frontend Component & Contract Tests: Operations Module
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 */

import { OperationalTaskCard } from '../../../../src/frontend/modules/operations/components/OperationalTaskCard';
import { CompletionGateBanner } from '../../../../src/frontend/modules/operations/components/CompletionGateBanner';
import { OperationalFulfillmentPage } from '../../../../src/frontend/modules/operations/pages/OperationalFulfillmentPage';
import { 
  OperationalTask, 
  UpdateTaskPayload, 
  CompleteTransferResponse 
} from '../../../../src/frontend/modules/operations/services/operations.api';

describe('Frontend Operations Module Structure & Contract Verification', () => {
  it('should export all operational UI components', () => {
    expect(OperationalTaskCard).toBeDefined();
    expect(CompletionGateBanner).toBeDefined();
    expect(OperationalFulfillmentPage).toBeDefined();
  });

  it('should validate OperationalTask data structure', () => {
    const task: OperationalTask = {
      id: 'task-it-01',
      category: 'IT',
      title: 'Provision Cloud Infrastructure Access',
      status: 'PENDING',
      assignedTeam: 'IT-Support-Bengaluru',
      completedAt: null,
      notes: null,
      completedBy: null,
    };

    expect(task.category).toBe('IT');
    expect(task.status).toBe('PENDING');
  });

  it('should validate UpdateTaskPayload structure', () => {
    const payload: UpdateTaskPayload = {
      status: 'COMPLETED',
      notes: 'Hardware handed over and badge created.',
      completedBy: 'facilities.officer@intglobal.com',
    };

    expect(payload.status).toBe('COMPLETED');
    expect(payload.notes).toContain('Hardware handed over');
  });

  it('should validate CompleteTransferResponse structure', () => {
    const response: CompleteTransferResponse = {
      transferId: 'tr-9001',
      status: 'COMPLETED',
      completedAt: '2026-09-15T13:00:00.000Z',
      message: 'Transfer closed successfully.',
    };

    expect(response.status).toBe('COMPLETED');
    expect(response.transferId).toBe('tr-9001');
  });
});
