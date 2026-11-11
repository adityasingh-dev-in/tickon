import { SafeUser } from './user.model.js';

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CommentWithAuthor extends Comment {
  author?: SafeUser | null;
}
