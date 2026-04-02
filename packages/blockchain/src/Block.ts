/**
 * Block Class
 * Represents a single block in the blockchain
 */

import crypto from 'crypto';
import { BlockData } from '@voting-chain/types';

export class Block {
  public hash: string;
  public nonce: number = 0;

  constructor(
    public index: number,
    public timestamp: number,
    public data: BlockData,
    public previousHash: string = ''
  ) {
    this.hash = this.calculateHash();
  }

  /**
   * Calculate the hash of the block using SHA-256
   */
  calculateHash(): string {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex');
  }

  /**
   * Mine the block with proof-of-work
   * @param difficulty - Number of leading zeros required in hash
   */
  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    
    console.log(`Block mined: ${this.hash}`);
  }
}

// Made with Bob
