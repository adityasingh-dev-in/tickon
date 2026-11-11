export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export type UserProfile = SafeUser;
