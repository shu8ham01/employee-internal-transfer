/**
 * Express Application Setup
 */

import express, { Express } from 'express';
import { createTransferRouter } from '../modules/transfers/routes/transfer.routes';
import { InMemoryTransferRepository } from '../modules/transfers/repositories/transfer.repository';
import { createWorkflowRouter } from '../modules/workflow/routes/workflow.routes';
import { InMemoryWorkflowRepository } from '../modules/workflow/repositories/workflow.repository';
import { createDashboardRouter } from '../modules/dashboard/routes/dashboard.routes';
import { InMemoryDashboardRepository } from '../modules/dashboard/repositories/dashboard.repository';
import { createOperationsRouter } from '../modules/operations/routes/operations.routes';
import { InMemoryOperationsRepository } from '../modules/operations/repositories/operations.repository';
import { createAuditRouter } from '../modules/audit/routes/audit.routes';
import { InMemoryAuditRepository } from '../modules/audit/repositories/audit.repository';
import { createNotificationRouter } from '../modules/notifications/routes/notification.routes';
import { InMemoryNotificationRepository } from '../modules/notifications/repositories/notification.repository';
import { errorHandler } from '../modules/transfers/controllers/transfer.controller';

export function createApp(
  transferRepo = new InMemoryTransferRepository(),
  workflowRepo = new InMemoryWorkflowRepository(),
  dashboardRepo = new InMemoryDashboardRepository(),
  operationsRepo = new InMemoryOperationsRepository(),
  auditRepo = new InMemoryAuditRepository(),
  notifRepo = new InMemoryNotificationRepository()
): Express {
  const app = express();

  app.use(express.json());

  // Mount transfers module
  const transferRouter = createTransferRouter(transferRepo);
  app.use('/api/v1/transfers', transferRouter);

  // Mount workflow module
  const workflowRouter = createWorkflowRouter(workflowRepo);
  app.use('/api/v1/transfers', workflowRouter);

  // Mount operations module
  const operationsRouter = createOperationsRouter(operationsRepo);
  app.use('/api/v1/transfers', operationsRouter);

  // Mount audit module
  const auditRouter = createAuditRouter(auditRepo);
  app.use('/api/v1/transfers', auditRouter);

  // Mount dashboard module
  const dashboardRouter = createDashboardRouter(dashboardRepo);
  app.use('/api/v1/dashboard', dashboardRouter);

  // Mount notifications module
  const notificationRouter = createNotificationRouter(notifRepo);
  app.use('/api/v1/notifications', notificationRouter);

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
