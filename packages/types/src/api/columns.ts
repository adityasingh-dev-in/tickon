export interface CreateColumnDto {
  title: string;
  position?: number;
  projectId: string;
}

export interface UpdateColumnDto {
  title?: string;
  position?: number;
}
