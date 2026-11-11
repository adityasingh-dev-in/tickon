export interface CreateClientDto {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
}

export interface UpdateClientDto {
  name?: string;
  email?: string;
  company?: string | null;
  phone?: string | null;
}
