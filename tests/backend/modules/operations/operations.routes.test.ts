/**
 * Integration Test Suite: Operations API Routes
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 * Endpoints:
 * - GET /api/v1/transfers/:id/operational-tasks
 * - PATCH /api/v1/transfers/:id/operational-tasks/:taskId
 * - POST /api/v1/transfers/:id/complete
 */

import request from 'supertest';
import { createApp } from '../../../../src/backend/app/server';
import { InMemoryTransferRepository } from '../../../../src/backend/modules/transfers/repositories/transfer.repository';
import { InMemoryWorkflowRepository } from '../../../../src/backend/modules/workflow/repositories/workflow.repository';
import { InMemoryDashboardRepository } from '../../../../src/backend/modules/dashboard/repositories/dashboard.repository';
import { InMemoryOperationsRepository } from '../../../../src/backend/modules/operations/repositories/operations.repository';

describe('Operations API Endpoints (Integration)', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    const transferRepo = new InMemoryTransferRepository();
    const workflowRepo = new InMemoryWorkflowRepository();
    const dashboardRepo = new InMemoryDashboardRepository();
    const operationsRepo = new InMemoryOperationsRepository();
    app = createApp(transferRepo, workflowRepo, dashboardRepo, operationsRepo);
  });

  it('GET /api/v1/transfers/:id/operational-tasks should return 200 with task list', async () => {
    const res = await request(app).get('/api/v1/transfers/tr-9001/operational-tasks');

    expect(res.status).toBe(200);
    expect(res.body.transferId).toBe('tr-9001');
    expect(res.body.tasks).toBeInstanceOf(Array);
    expect(res.body.tasks).toHaveLength(3);
    expect(res.body.isAllCompleted).toBe(false);
  });

  it('PATCH /api/v1/transfers/:id/operational-tasks/:taskId should return 200 with updated task', async () => {
    const res = await request(app)
      .patch('/api/v1/transfers/tr-9001/operational-tasks/task-it-01')
      .send({
        status: 'COMPLETED',
        notes: 'Laptop shipped and credentials dispatched.',
        completedBy: 'it.officer@intglobal.com',
      });

    expect(res.status).toBe(200);
    expect(res.body.taskId).toBe('task-it-01');
    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.notes).toContain('Laptop shipped');
    expect(res.body.remainingPendingTasksCount).toBeDefined();
  });

  it('POST /api/v1/transfers/:id/complete should return 400 if tasks are pending', async () => {
    const res = await request(app)
      .post('/api/v1/transfers/tr-9001/complete')
      .set('x-user-id', 'hr-301')
      .set('x-user-role', 'HR_ADMIN');

    // Initially task-it-01 and task-pay-01 are PENDING
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('remain pending');
  });

  it('POST /api/v1/transfers/:id/complete should return 403 if caller is not HR', async () => {
    const res = await request(app)
      .post('/api/v1/transfers/tr-9001/complete')
      .set('x-user-id', 'emp-001')
      .set('x-user-role', 'EMPLOYEE');

    expect(res.status).toBe(403);
  });
});
