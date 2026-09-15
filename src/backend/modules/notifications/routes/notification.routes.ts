/**
 * Notification Routes
 * Mounts endpoints for listing and updating notification statuses.
 */

import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import { INotificationRepository } from '../repositories/notification.repository';

export function createNotificationRouter(repository: INotificationRepository): Router {
  const router = Router();
  const service = new NotificationService(repository);
  const controller = new NotificationController(service);

  router.get('/', controller.getNotifications);
  router.patch('/:id/read', controller.markAsRead);

  return router;
}
