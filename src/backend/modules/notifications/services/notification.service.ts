/**
 * Notification Service
 * Dispatches in-app and simulated email alerts for stage movements and reviewer decisions.
 */

import {
  INotificationRepository,
  InMemoryNotificationRepository,
  Notification,
} from '../repositories/notification.repository';

export interface StageTransitionNotificationInput {
  transferId: string;
  recipientId: string;
  stage: string;
  applicantName: string;
}

export interface DecisionNotificationInput {
  transferId: string;
  applicantId: string;
  reviewerName: string;
  decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';
  stageName: string;
  remarks?: string;
}

export interface UserNotificationsResult {
  unreadCount: number;
  notifications: Notification[];
}

export class NotificationService {
  constructor(
    private readonly repository: INotificationRepository = new InMemoryNotificationRepository()
  ) {}

  /**
   * Dispatches notifications to the incoming reviewer when a transfer enters a new workflow stage.
   */
  async dispatchStageTransitionNotification(
    input: StageTransitionNotificationInput
  ): Promise<Notification> {
    const formattedStage = this.humanizeStage(input.stage);

    const notification = await this.repository.create({
      recipientId: input.recipientId,
      type: 'WORKFLOW_UPDATE',
      title: `Transfer Request Moved to ${formattedStage}`,
      message: `Transfer request ${input.transferId} submitted by ${input.applicantName} is now ready for your review at stage: ${formattedStage}.`,
      actionUrl: `/transfers/${input.transferId}`,
    });

    // Simulated email dispatch log
    // eslint-disable-next-line no-console
    console.log(`[EMAIL_DISPATCH] To: ${input.recipientId} | Subject: ${notification.title}`);

    return notification;
  }

  /**
   * Dispatches notifications to the applicant when a reviewer records a decision.
   */
  async dispatchDecisionNotification(input: DecisionNotificationInput): Promise<Notification> {
    let outcomeTitle = 'Transfer Request Decision';
    if (input.decision === 'APPROVED') {
      outcomeTitle = 'Transfer Request Approved';
    } else if (input.decision === 'REVISION_REQUESTED') {
      outcomeTitle = 'Transfer Request Revision Requested';
    } else if (input.decision === 'REJECTED') {
      outcomeTitle = 'Transfer Request Rejected';
    }

    const remarksText = input.remarks ? ` Remarks: ${input.remarks}` : '';
    const message = `Your transfer request ${input.transferId} was reviewed by ${input.reviewerName} at ${input.stageName}. Decision: ${input.decision}.${remarksText}`;

    const notification = await this.repository.create({
      recipientId: input.applicantId,
      type: 'WORKFLOW_UPDATE',
      title: outcomeTitle,
      message,
      actionUrl: `/transfers/${input.transferId}`,
    });

    // Simulated email dispatch log
    // eslint-disable-next-line no-console
    console.log(`[EMAIL_DISPATCH] To: ${input.applicantId} | Subject: ${notification.title}`);

    return notification;
  }

  /**
   * Fetches all in-app notifications for a user and calculates the unread count.
   */
  async getUserNotifications(userId: string): Promise<UserNotificationsResult> {
    const notifications = await this.repository.findByRecipientId(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      unreadCount,
      notifications,
    };
  }

  /**
   * Marks an individual notification as read.
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const readAt = new Date().toISOString();
    return this.repository.markAsRead(notificationId, readAt);
  }

  private humanizeStage(stage: string): string {
    return stage
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
