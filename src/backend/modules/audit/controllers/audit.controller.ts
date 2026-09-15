/**
 * Audit Controller
 * Handles HTTP requests for retrieving audit trails.
 */

import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  getAuditTrail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const trail = await this.auditService.getAuditTrail(id);
      res.status(200).json(trail);
    } catch (error) {
      next(error);
    }
  };
}
