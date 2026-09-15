/**
 * Transfer HTTP Controller
 */

import { Request, Response, NextFunction } from 'express';
import { TransferService } from '../services/transfer.service';
import { AppError } from '../../../shared/errors';

export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  checkEligibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In production, employeeId is extracted from authenticated JWT session (req.user.id)
      const employeeId = (req.headers['x-employee-id'] as string) || (req.query.employeeId as string) || 'emp-001';
      const eligibility = await this.transferService.checkEligibility(employeeId);
      res.status(200).json(eligibility);
    } catch (error) {
      next(error);
    }
  };

  getLookupData = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lookups = await this.transferService.getLookupData();
      res.status(200).json(lookups);
    } catch (error) {
      next(error);
    }
  };

  submitTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employeeId = (req.headers['x-employee-id'] as string) || req.body.employeeId || 'emp-001';
      const created = await this.transferService.submitTransferRequest(employeeId, req.body);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      details: err.details,
    });
    return;
  }

  res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
}
