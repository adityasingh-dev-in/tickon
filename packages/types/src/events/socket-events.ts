import { CommentWithAuthor } from '../models/comment.model.js';
import { FileAsset } from '../models/file-asset.model.js';
import { KanbanColumn } from '../models/kanban-column.model.js';
import { Label } from '../models/label.model.js';
import { Notification } from '../models/notification.model.js';
import { ProjectMember } from '../models/project.model.js';
import { TaskWithDetails } from '../models/task.model.js';

export const SOCKET_EVENTS = {
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_MOVED: 'task.moved',
  TASK_DELETED: 'task.deleted',

  COMMENT_CREATED: 'comment.created',
  COMMENT_UPDATED: 'comment.updated',
  COMMENT_DELETED: 'comment.deleted',

  MEMBER_ADDED: 'member.added',
  MEMBER_UPDATED: 'member.updated',
  MEMBER_REMOVED: 'member.removed',

  NOTIFICATION_CREATED: 'notification.created',

  COLUMN_CREATED: 'column.created',
  COLUMN_UPDATED: 'column.updated',
  COLUMN_DELETED: 'column.deleted',

  LABEL_CREATED: 'label.created',
  LABEL_UPDATED: 'label.updated',
  LABEL_DELETED: 'label.deleted',
} as const;

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

export interface RealtimeEvent<T> {
  eventId: string;
  projectId: string;
  actorId: string | null;
  occurredAt: string;
  data: T;
}

export interface RealtimeNotificationEvent<T> {
  eventId: string;
  actorId: string | null;
  occurredAt: string;
  data: T;
}

// Task Event Data
export interface TaskCreatedEventData {
  task: TaskWithDetails;
}

export interface TaskUpdatedEventData {
  task: TaskWithDetails;
}

export interface TaskMovedEventData {
  task: TaskWithDetails;
  fromColumnId: string;
  positions: { id: string; position: number }[] | null;
}

export interface TaskDeletedEventData {
  taskId: string;
  columnId: string;
}

// Comment Event Data
export interface CommentCreatedEventData {
  comment: CommentWithAuthor;
}

export interface CommentUpdatedEventData {
  comment: CommentWithAuthor;
}

export interface CommentDeletedEventData {
  commentId: string;
  taskId: string;
}

// Member Event Data
export interface MemberAddedEventData {
  member: ProjectMember;
}

export interface MemberUpdatedEventData {
  member: ProjectMember;
}

export interface MemberRemovedEventData {
  userId: string;
}

// Notification Event Data
export interface NotificationCreatedEventData {
  notification: Notification;
}

// Column Event Data
export interface ColumnCreatedEventData {
  column: KanbanColumn;
}

export interface ColumnUpdatedEventData {
  column: KanbanColumn;
  columns?: KanbanColumn[];
}

export interface ColumnDeletedEventData {
  columnId: string;
}

// Label Event Data
export interface LabelCreatedEventData {
  label: Label;
}

export interface LabelUpdatedEventData {
  label: Label;
}

export interface LabelDeletedEventData {
  labelId: string;
}

// Full Socket.IO Typed Event Map
export interface SocketEventMap {
  [SOCKET_EVENTS.TASK_CREATED]: (payload: RealtimeEvent<TaskCreatedEventData>) => void;
  [SOCKET_EVENTS.TASK_UPDATED]: (payload: RealtimeEvent<TaskUpdatedEventData>) => void;
  [SOCKET_EVENTS.TASK_MOVED]: (payload: RealtimeEvent<TaskMovedEventData>) => void;
  [SOCKET_EVENTS.TASK_DELETED]: (payload: RealtimeEvent<TaskDeletedEventData>) => void;

  [SOCKET_EVENTS.COMMENT_CREATED]: (payload: RealtimeEvent<CommentCreatedEventData>) => void;
  [SOCKET_EVENTS.COMMENT_UPDATED]: (payload: RealtimeEvent<CommentUpdatedEventData>) => void;
  [SOCKET_EVENTS.COMMENT_DELETED]: (payload: RealtimeEvent<CommentDeletedEventData>) => void;

  [SOCKET_EVENTS.MEMBER_ADDED]: (payload: RealtimeEvent<MemberAddedEventData>) => void;
  [SOCKET_EVENTS.MEMBER_UPDATED]: (payload: RealtimeEvent<MemberUpdatedEventData>) => void;
  [SOCKET_EVENTS.MEMBER_REMOVED]: (payload: RealtimeEvent<MemberRemovedEventData>) => void;

  [SOCKET_EVENTS.NOTIFICATION_CREATED]: (payload: RealtimeNotificationEvent<NotificationCreatedEventData>) => void;

  [SOCKET_EVENTS.COLUMN_CREATED]: (payload: RealtimeEvent<ColumnCreatedEventData>) => void;
  [SOCKET_EVENTS.COLUMN_UPDATED]: (payload: RealtimeEvent<ColumnUpdatedEventData>) => void;
  [SOCKET_EVENTS.COLUMN_DELETED]: (payload: RealtimeEvent<ColumnDeletedEventData>) => void;

  [SOCKET_EVENTS.LABEL_CREATED]: (payload: RealtimeEvent<LabelCreatedEventData>) => void;
  [SOCKET_EVENTS.LABEL_UPDATED]: (payload: RealtimeEvent<LabelUpdatedEventData>) => void;
  [SOCKET_EVENTS.LABEL_DELETED]: (payload: RealtimeEvent<LabelDeletedEventData>) => void;
}
