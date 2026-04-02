/**
 * Voter Types
 * Defines all types related to voters and authentication
 */

/**
 * Full voter interface (includes sensitive data)
 */
export interface Voter {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  voterId: string;
  createdAt: Date;
  registeredAt: Date;
}

/**
 * Public voter interface (excludes sensitive data)
 */
export interface VoterPublic {
  id: string;
  name: string;
  email: string;
  voterId: string;
  registeredAt: Date;
}

/**
 * Voter registration request
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Voter login request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  token: string;
  voter: VoterPublic;
}

/**
 * Utility type: Voter without password
 */
export type VoterWithoutPassword = Omit<Voter, 'passwordHash'>;

// Made with Bob
