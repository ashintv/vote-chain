/**
 * Results Types
 * Defines all types related to election results and statistics
 */

import { Candidate } from './election';
import { ElectionStatus } from './election';

/**
 * Result for a single candidate
 */
export interface CandidateResult {
  candidate: Candidate;
  voteCount: number;
  percentage: number;
}

/**
 * Complete election results
 */
export interface ElectionResults {
  electionId: string;
  results: CandidateResult[];
  candidates: CandidateResult[];
  totalVotes: number;
  status: ElectionStatus;
}

/**
 * Alias for ElectionResults (for backward compatibility)
 */
export type Results = ElectionResults;

/**
 * Vote statistics for analytics
 */
export interface VoteStatistics {
  totalVoters: number;
  votedCount: number;
  turnoutPercentage: number;
  votesByHour: { hour: number; count: number }[];
}

// Made with Bob
