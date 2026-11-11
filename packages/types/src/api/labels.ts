export interface CreateLabelDto {
  name: string;
  color: string;
  projectId: string;
}

export interface UpdateLabelDto {
  name?: string;
  color?: string;
}
