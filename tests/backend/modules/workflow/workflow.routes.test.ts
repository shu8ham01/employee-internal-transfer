/**
 * Integration Test Suite: Workflow API Routes
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 * Endpoints:
 * - GET /api/v1/transfers/:id/workflow
 * - POST /api/v1/transfers/:id/decisions
 */

import request from 'supertest';
import { createApp } from '../../../../src/backend/app/server';
import { InMemoryTransferRepository } from '../../../../src/backend/modules/transfers/repositories/transfer.repository';
import { InMemoryWorkflowRepository } from '../../../../src/backend/modules/workflow/repositories/workflow.repository';

describe('Workflow API Endpoints (Integration)', () => {
  let app: ReturnType<typeof createApp>;
  let transferRepo: InMemoryTransferRepository;
  let workflowRepo: InMemoryWorkflowRepository;

  beforeEach(() => {
    transferRepo = new InMemoryTransferRepository();
    workflowRepo = new InMemoryWorkflowRepository();
    app = createApp(transferRepo, workflowRepo);
  });

  describe('GET /api/v1/transfers/:id/workflow', () => {
    it('should return 200 with workflow state for authorized participant', async () => {
      const res = await request(app)
        .get('/api/v1/transfers/tr-9001/workflow')
        .set('x-user-id', 'mgr-101');

      expect(res.status).toBe(200);
      expect(res.body.transferId).toBe('tr-9001');
      expect(res.body.status).toBe('IN_REVIEW');
      expect(res.body.currentStage.stageName).toBe('CURRENT_MANAGER_REVIEW');
      expect(res.body.currentStage.assignedReviewer.id).toBe('mgr-101');
    });

    it('should return 403 when caller is not a workflow participant', async () => {
      const res = await request(app)
        .get('/api/v1/transfers/tr-9001/workflow')
        .set('x-user-id', 'outsider-999');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access restricted');
    });

    it('should return 404 when transfer does not exist', async () => {
      const res = await request(app)
        .get('/api/v1/transfers/non-existent-id/workflow')
        .set('x-user-id', 'mgr-101');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/transfers/:id/decisions', () => {
    it('should return 200 and advance stage when assigned reviewer approves', async () => {
      const res = await request(app)
        .post('/api/v1/transfers/tr-9001/decisions')
        .set('x-user-id', 'mgr-101')
        .send({
          action: 'APPROVE',
          remarks: 'Release approved effective 2026-11-01. Handover planned.',
          targetReleaseDate: '2026-11-01T00:00:00.000Z',
        });

      expect(res.status).toBe(200);
      expect(res.body.previousStage).toBe('CURRENT_MANAGER_REVIEW');
      expect(res.body.currentStage).toBe('HIRING_MANAGER_REVIEW');
      expect(res.body.status).toBe('IN_REVIEW');
      expect(res.body.decision.action).toBe('APPROVE');
    });

    it('should return 403 when non-assigned user attempts to submit decision', async () => {
      const res = await request(app)
        .post('/api/v1/transfers/tr-9001/decisions')
        .set('x-user-id', 'unauthorized-user')
        .send({
          action: 'APPROVE',
          remarks: 'Unauthorized approval attempt',
        });

      expect(res.status).toBe(403);
    });

    it('should return 400 when remarks are missing or empty', async () => {
      const res = await request(app)
        .post('/api/v1/transfers/tr-9001/decisions')
        .set('x-user-id', 'mgr-101')
        .send({
          action: 'APPROVE',
          remarks: '',
        });

      expect(res.status).toBe(400);
    });
  });
});
