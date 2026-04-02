/**
 * Election Types
 * Defines all types related to elections and candidates
 */

/**
 * Election status enum
 */
export enum ElectionStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  CLOSED = 'closed',
  FINALIZED = 'finalized'
}

/**
 * Main election interface
 */
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  startTime: number;
  endTime: number;
  status: ElectionStatus;
  createdBy: string;
  createdAt: Date;
}

/**
 * Candidate interface
 */
export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  party?: string;
  description?: string;
  imageUrl?: string;
  registeredAt: Date;
}

/**
 * Request to create a new election
 */
export interface CreateElectionRequest {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

/**
 * Request to create a new candidate
 */
export interface CreateCandidateRequest {
  name: string;
  party?: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Request to update election status
 */
export interface UpdateElectionStatusRequest {
  status: ElectionStatus;
}

// Made with Bob
