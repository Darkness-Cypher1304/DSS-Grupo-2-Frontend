// ============================================================================
// Fixtures de usuarios / sesión (datos de prueba limpios y reutilizables)
// ============================================================================
import type { AuthUser, LoginResponse, UserRole } from '@/lib/api-client';

export function makeAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'usr_1',
    email: 'padre@neuroalert.pe',
    fullName: 'Padre Demo',
    role: 'PARENT',
    emailVerified: true,
    ...overrides,
  };
}

export function makeLoginResponse(
  overrides: Partial<LoginResponse> = {},
  userOverrides: Partial<AuthUser> = {},
): LoginResponse {
  return {
    user: makeAuthUser(userOverrides),
    accessToken: 'access-token-demo',
    ...overrides,
  };
}

export const ROLES: UserRole[] = ['PARENT', 'SPECIALIST', 'ADMIN'];
