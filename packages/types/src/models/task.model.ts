import { Priority } from '../enums/priority.enum.js';
import { Comment } from './comment.model.js';
import { FileAsset } from './file-asset.model.js';
import { Label } from './label.model.js';
import { SafeUser } from './user.model.js';

export interface Task {
  id: string;
  taskNumber: number;
  taskKey: string;
  title: string;
  description: string | null;
  priority: Priority;
  position: number;
  dueDate: Date | string | null;
  projectId: string;
  columnId: string;
  assigneeId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TaskWithDetails extends Task {
  assignee?: SafeUser | null;
  labels?: Label[];
  comments?: Comment[];
  attachments?: FileAsset[];
  _count?: {
    comments: number;
    attachments: number;
  };
}
