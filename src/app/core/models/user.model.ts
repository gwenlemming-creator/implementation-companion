export type UserRole = 'service_provider' | 'worksite_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
