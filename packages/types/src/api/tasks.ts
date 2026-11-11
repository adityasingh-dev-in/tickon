import { Priority } from '../enums/priority.enum.js';

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  priority?: Priority;
  projectId: string;
  columnId: string;
  dueDate?: Date | string | null;
  assigneeId?: string | null;
  labelIds?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string | null;
  priority?: Priority;
  columnId?: string;
  dueDate?: Date | string | null;
  assigneeId?: string | null;
  labelIds?: string[];
}

export interface MoveTaskDto {
  columnId: string;
  prevTaskId: string | null;
  nextTaskId: string | null;
}
