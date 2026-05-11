// Data returned from the JWT payload
export interface JwtPayload {
  sub: string;  // user id (as string)
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Roles defined by the backend RBAC system
export type UserRole = 'CLIENT' | 'ADMIN' | 'SELLER';

// Hydrated user object stored in AuthContext
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

// Token pair returned on successful login
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Shape exposed by AuthContext
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (tokens: AuthTokens) => void;
  logout: () => void;
}
