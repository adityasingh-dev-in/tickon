import type { Task } from './task.model.ts';

export interface KanbanColumn {
  id: string;
  title: string;
  position: number;
  projectId: string;
  createdAt: Date | string;
}

export interface KanbanColumnWithTasks extends KanbanColumn {
  tasks: Task[];
}
