export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT'
}

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  tenant?: {
    id: string;
    name: string;
  };
}
