/**
 * Integration Test Suite: Dashboard API Routes
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 * Endpoints:
 * - GET /api/v1/dashboard/transfers
 * - GET /api/v1/dashboard/transfers/:id/timeline
 * - GET /api/v1/dashboard/approvals/pending
 */

import request from 'supertest';
import { createApp } from '../../../../src/backend/app/server';
import { InMemoryTransferRepository } from '../../../../src/backend/modules/transfers/repositories/transfer.repository';
import { InMemoryWorkflowRepository } from '../../../../src/backend/modules/workflow/repositories/workflow.repository';
import { InMemoryDashboardRepository } from '../../../../src/backend/modules/dashboard/repositories/dashboard.repository';

describe('Dashboard API Endpoints (Integration)', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    const transferRepo = new InMemoryTransferRepository();
    const workflowRepo = new InMemoryWorkflowRepository();
    const dashboardRepo = new InMemoryDashboardRepository();
    app = createApp(transferRepo, workflowRepo, dashboardRepo);
  });

  it('GET /api/v1/dashboard/transfers should return 200 with user transfer list', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/transfers')
      .set('x-user-id', 'emp-001');

    expect(res.status).toBe(200);
    expect(res.body.transfers).toBeInstanceOf(Array);
    expect(res.body.totalCount).toBe(1);
    expect(res.body.transfers[0].id).toBe('tr-9001');
    expect(res.body.transfers[0].currentStage).toBe('CURRENT_MANAGER_REVIEW');
  });

  it('GET /api/v1/dashboard/transfers/:id/timeline should return 200 with milestone progression', async () => {
    const res = await request(app).get('/api/v1/dashboard/transfers/tr-9001/timeline');

    expect(res.status).toBe(200);
    expect(res.body.transferId).toBe('tr-9001');
    expect(res.body.milestones).toHaveLength(5);
    expect(res.body.bottleneck).toBeDefined();
    expect(res.body.bottleneck.slaHours).toBe(72);
  });

  it('GET /api/v1/dashboard/approvals/pending should return 200 with queue for manager', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/approvals/pending')
      .set('x-user-id', 'mgr-101');

    expect(res.status).toBe(200);
    expect(res.body.pendingApprovals).toBeInstanceOf(Array);
    expect(res.body.pendingApprovals.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pendingApprovals[0].stage).toBe('CURRENT_MANAGER_REVIEW');
  });
});
