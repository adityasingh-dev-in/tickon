import { NotificationType } from '../enums/notification.enum.js';

export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  type: NotificationType;
  createdAt: Date | string;
}
