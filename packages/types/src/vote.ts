/**
 * Vote Types
 * Defines all types related to voting and vote verification
 */

/**
 * Vote record in database
 */
export interface Vote {
  id: string;
  electionId: string;
  voterId: string;
  candidateId: string;
  hashedVoterId: string;
  blockHash: string;
  timestamp: number;
}

/**
 * Vote receipt given to voter after casting vote
 */
export interface VoteReceipt {
  receiptId: string;
  voterId: string;
  electionId: string;
  candidateId: string;
  blockHash: string;
  blockIndex: number;
  timestamp: number;
}

/**
 * Request to cast a vote
 */
export interface CastVoteRequest {
  electionId: string;
  candidateId: string;
}

/**
 * Vote verification result
 */
export interface VoteVerification {
  valid: boolean;
  blockIndex: number;
  timestamp: number;
  electionId: string;
  candidateId: string;
}

// Made with Bob
