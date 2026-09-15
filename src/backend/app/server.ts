/**
 * Express Application Setup
 */

import express, { Express } from 'express';
import { createTransferRouter } from '../modules/transfers/routes/transfer.routes';
import { InMemoryTransferRepository } from '../modules/transfers/repositories/transfer.repository';
import { errorHandler } from '../modules/transfers/controllers/transfer.controller';

export function createApp(repository = new InMemoryTransferRepository()): Express {
  const app = express();

  app.use(express.json());

  // Mount transfers module
  const transferRouter = createTransferRouter(repository);
  app.use('/api/v1/transfers', transferRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
}

if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
  });
}
