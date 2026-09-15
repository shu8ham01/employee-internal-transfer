/**
 * Transfer API Routes
 */

import { Router } from 'express';
import { TransferController } from '../controllers/transfer.controller';
import { TransferService } from '../services/transfer.service';
import { ITransferRepository } from '../repositories/transfer.repository';

export function createTransferRouter(
  repository: ITransferRepository,
  service?: TransferService
): Router {
  const transferService = service || new TransferService(repository);
  const controller = new TransferController(transferService);
  const router = Router();

  router.get('/eligibility', controller.checkEligibility);
  router.get('/lookup-data', controller.getLookupData);
  router.post('/', controller.submitTransfer);

  return router;
}
