/**
 * Audit Routes
 * Mounts endpoints for audit trails.
 */

import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { AuditService } from '../services/audit.service';
import { IAuditRepository } from '../repositories/audit.repository';

export function createAuditRouter(repository: IAuditRepository): Router {
  const router = Router();
  const service = new AuditService(repository);
  const controller = new AuditController(service);

  router.get('/:id/audit-trail', controller.getAuditTrail);

  return router;
}
