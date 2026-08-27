// ==========================================
// Enums & Constants
// ==========================================

export type UserRole = 'ADMIN' | 'MEMBER' | 'CLIENT' | 'GUEST';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_COMMENT'
  | 'PROJECT_INVITE'
  | 'SYSTEM_ALERT';

// ==========================================
// User & Auth
// ==========================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserSetting {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuthSession {
  user: User;
  accessToken?: string;
  expiresIn?: number;
}

// ==========================================
// Client & Workspace
// ==========================================

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
  phone?: string | null;
  ownerId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==========================================
// Project
// ==========================================

export interface Project {
  id: string;
  title: string;
  key: string;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  ownerId: string;
  clientId?: string | null;
  client?: Client | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  columns?: KanbanColumn[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==========================================
// Kanban & Tasks
// ==========================================

export interface KanbanColumn {
  id: string;
  name: string;
  order: number;
  color?: string | null;
  projectId: string;
  tasks?: Task[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  projectId: string;
  columnId?: string | null;
  creatorId: string;
  assigneeId?: string | null;
  assignee?: User | null;
  dueDate?: Date | string | null;
  labels?: Label[];
  commentsCount?: number;
  attachmentsCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author?: User | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  publicId: string;
  size: number;
  mimeType: string;
  taskId?: string | null;
  projectId?: string | null;
  uploaderId: string;
  createdAt: Date | string;
}

// ==========================================
// Notifications & Activity
// ==========================================

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  createdAt: Date | string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: User | null;
  projectId?: string | null;
  taskId?: string | null;
  action: string;
  details?: Record<string, unknown> | null;
  createdAt: Date | string;
}

// ==========================================
// Standard API Contracts
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]> | string[];
  timestamp: string;
  path?: string;
}
