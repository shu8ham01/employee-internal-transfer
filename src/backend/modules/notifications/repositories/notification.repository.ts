/**
 * Notification Repository Interface and In-Memory Implementation
 */

export interface Notification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  actionUrl: string;
}

export interface INotificationRepository {
  create(payload: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification>;
  findByRecipientId(recipientId: string): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  markAsRead(id: string, readAt: string): Promise<Notification>;
}

export class InMemoryNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = [];
  private sequence = 501;

  async create(payload: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const notification: Notification = {
      ...payload,
      id: `notif-${this.sequence++}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.push(notification);
    return { ...notification };
  }

  async findByRecipientId(recipientId: string): Promise<Notification[]> {
    return this.notifications
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((n) => ({ ...n }));
  }

  async findById(id: string): Promise<Notification | null> {
    const found = this.notifications.find((n) => n.id === id);
    return found ? { ...found } : null;
  }

  async markAsRead(id: string, readAt: string): Promise<Notification> {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) {
      throw new Error('Notification not found');
    }
    notif.isRead = true;
    notif.readAt = readAt;
    return { ...notif };
  }

  clear(): void {
    this.notifications = [];
    this.sequence = 501;
  }
}
