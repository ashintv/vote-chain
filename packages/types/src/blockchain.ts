/**
 * Blockchain Types
 * Defines types for blockchain data structures
 */

/**
 * Block data stored in blockchain
 */
export interface BlockData {
  type: string;
  electionId: string;
  candidateId: string;
  voterHash: string;
  timestamp: number;
}

/**
 * Block information (for API responses)
 */
export interface BlockInfo {
  index: number;
  timestamp: number;
  hash: string;
  previousHash: string;
  nonce: number;
  data: BlockData | any;
}

/**
 * Chain validation result
 */
export interface ChainValidation {
  valid: boolean;
  errors: string[];
  blockCount: number;
}

// Made with Bob
