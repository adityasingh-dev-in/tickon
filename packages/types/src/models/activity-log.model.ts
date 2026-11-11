import { ActivityAction } from '../enums/activity.enum.js';
import { ActivityEntityType } from '../enums/activity-entity.enum.js';
import { SafeUser } from './user.model.js';

export interface ActivityLog {
  id: string;
  actorId: string | null;
  projectId: string;
  entityType: ActivityEntityType;
  entityId: string | null;
  action: ActivityAction | string;
  details: Record<string, unknown> | null;
  createdAt: Date | string;
}

export interface ActivityLogWithActor extends ActivityLog {
  actor?: SafeUser | null;
}
