/**
 * Integration Test Suite: Transfer API Routes
 * Endpoints:
 * - GET /api/v1/transfers/eligibility
 * - GET /api/v1/transfers/lookup-data
 * - POST /api/v1/transfers
 */

import request from 'supertest';
import { createApp } from '../../../../src/backend/app/server';
import { InMemoryTransferRepository } from '../../../../src/backend/modules/transfers/repositories/transfer.repository';

describe('Transfer API Endpoints (Integration)', () => {
  let app: ReturnType<typeof createApp>;
  let repository: InMemoryTransferRepository;

  beforeEach(() => {
    repository = new InMemoryTransferRepository();
    app = createApp(repository);
  });

  it('GET /api/v1/transfers/eligibility should return 200 with employee eligibility', async () => {
    const res = await request(app)
      .get('/api/v1/transfers/eligibility')
      .set('x-employee-id', 'emp-001');

    expect(res.status).toBe(200);
    expect(res.body.isEligible).toBe(true);
    expect(res.body.currentDepartment.name).toBe('Frontend Engineering');
    expect(res.body.currentRole.title).toBe('Software Engineer');
  });

  it('GET /api/v1/transfers/lookup-data should return 200 with departments, locations, and roles', async () => {
    const res = await request(app).get('/api/v1/transfers/lookup-data');

    expect(res.status).toBe(200);
    expect(res.body.departments).toBeInstanceOf(Array);
    expect(res.body.locations).toBeInstanceOf(Array);
    expect(res.body.roles).toBeInstanceOf(Array);
  });

  it('POST /api/v1/transfers should return 201 when submitting valid transfer', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);

    const payload = {
      proposedDepartmentId: 'dept-102',
      proposedLocationId: 'loc-302',
      proposedRoleId: 'role-202',
      effectiveDate: futureDate.toISOString(),
      transferReason: 'Advancing career into Cloud Infrastructure',
    };

    const res = await request(app)
      .post('/api/v1/transfers')
      .set('x-employee-id', 'emp-001')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('SUBMITTED');
    expect(res.body.currentStage).toBe('CURRENT_MANAGER_REVIEW');
  });

  it('POST /api/v1/transfers should return 409 Conflict if employee already has active transfer', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);

    const payload = {
      proposedDepartmentId: 'dept-102',
      proposedLocationId: 'loc-302',
      proposedRoleId: 'role-202',
      effectiveDate: futureDate.toISOString(),
      transferReason: 'First request',
    };

    // First request succeeds
    await request(app)
      .post('/api/v1/transfers')
      .set('x-employee-id', 'emp-001')
      .send(payload);

    // Second request conflicts
    const res = await request(app)
      .post('/api/v1/transfers')
      .set('x-employee-id', 'emp-001')
      .send(payload);

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already in progress');
  });

  it('POST /api/v1/transfers should return 422 if proposed department and role match current', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);

    const payload = {
      proposedDepartmentId: 'dept-101', // Same department
      proposedLocationId: 'loc-302',
      proposedRoleId: 'role-201',       // Same role
      effectiveDate: futureDate.toISOString(),
    };

    const res = await request(app)
      .post('/api/v1/transfers')
      .set('x-employee-id', 'emp-001')
      .send(payload);

    expect(res.status).toBe(422);
  });

  it('POST /api/v1/transfers should return 400 if effectiveDate is in the past', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    const payload = {
      proposedDepartmentId: 'dept-102',
      proposedLocationId: 'loc-302',
      proposedRoleId: 'role-202',
      effectiveDate: pastDate.toISOString(),
    };

    const res = await request(app)
      .post('/api/v1/transfers')
      .set('x-employee-id', 'emp-001')
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.details).toBeDefined();
  });
});
