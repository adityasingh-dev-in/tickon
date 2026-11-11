import { ProjectRole } from '../enums/role.enum.js';
import { Client } from './client.model.js';
import { KanbanColumn } from './kanban-column.model.js';
import { SafeUser } from './user.model.js';

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string | null;
  taskCounter: number;
  clientId: string | null;
  createdById: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: Date | string;
  user?: SafeUser;
}

export interface ProjectWithDetails extends Project {
  client?: Client | null;
  members?: ProjectMember[];
  columns?: KanbanColumn[];
  _count?: {
    tasks: number;
    members: number;
  };
}
