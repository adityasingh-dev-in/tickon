import { ProjectRole } from '../enums/role.enum.js';

export interface CreateProjectDto {
  key: string;
  name: string;
  description?: string | null;
  clientId?: string | null;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string | null;
  clientId?: string | null;
}

export interface AddProjectMemberDto {
  userId?: string;
  email?: string;
  role: ProjectRole;
}

export interface UpdateProjectMemberRoleDto {
  role: ProjectRole;
}
