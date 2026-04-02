/**
 * WebSocket Event Types
 * Defines all real-time event types and payloads
 */

import { ElectionResults } from './results';

/**
 * WebSocket event names
 */
export enum WebSocketEvent {
  ELECTION_CREATED = 'election:created',
  ELECTION_STARTED = 'election:started',
  ELECTION_ENDED = 'election:ended',
  VOTE_CAST = 'vote:cast',
  BLOCK_MINED = 'block:mined',
  RESULTS_UPDATED = 'results:updated'
}

/**
 * Vote cast event payload
 */
export interface VoteCastEvent {
  electionId: string;
  blockIndex: number;
  timestamp: number;
}

/**
 * Block mined event payload
 */
export interface BlockMinedEvent {
  blockIndex: number;
  hash: string;
  timestamp: number;
}

/**
 * Results updated event payload
 */
export interface ResultsUpdatedEvent {
  electionId: string;
  results: ElectionResults;
}

/**
 * Election status changed event payload
 */
export interface ElectionStatusChangedEvent {
  electionId: string;
  status: string;
  timestamp: number;
}

/**
 * Generic WebSocket message wrapper
 */
export interface WebSocketMessage<T = any> {
  event: WebSocketEvent;
  payload: T;
  timestamp: number;
}

// Made with Bob
