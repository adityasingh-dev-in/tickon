export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
