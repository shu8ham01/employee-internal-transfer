/**
 * Notification Controller
 * Handles HTTP requests for listing notifications and marking them as read.
 */

import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'emp-001';
      const result = await this.notificationService.getUserNotifications(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updated = await this.notificationService.markAsRead(id);
      res.status(200).json({
        id: updated.id,
        isRead: updated.isRead,
        readAt: updated.readAt,
      });
    } catch (error: any) {
      if (error.message === 'Notification not found') {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }
      next(error);
    }
  };
}
