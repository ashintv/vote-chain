/**
 * Blockchain Class
 * Manages the chain of blocks with validation and mining
 */

import { Block } from './Block';
import { BlockData } from '@voting-chain/types';

export class Blockchain {
  public chain: Block[];
  public difficulty: number;

  constructor(difficulty: number = 2) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
  }

  /**
   * Create the genesis (first) block
   */
  private createGenesisBlock(): Block {
    return new Block(0, Date.now(), {
      type: 'genesis',
      electionId: 'genesis',
      candidateId: 'genesis',
      voterHash: 'genesis',
      timestamp: Date.now()
    }, '0');
  }

  /**
   * Get the latest block in the chain
   */
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a new block to the chain
   * @param data - Vote data to store in the block
   * @returns The newly created block
   */
  addBlock(data: BlockData): Block {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      this.getLatestBlock().hash
    );
    
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    
    return newBlock;
  }

  /**
   * Validate the entire blockchain
   * @returns true if chain is valid, false otherwise
   */
  isChainValid(): boolean {
    // Start from index 1 (skip genesis block)
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block's hash is correct
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.error(`Block ${i} has invalid hash`);
        return false;
      }

      // Verify link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`Block ${i} has invalid previous hash`);
        return false;
      }

      // Verify proof of work
      const target = Array(this.difficulty + 1).join('0');
      if (currentBlock.hash.substring(0, this.difficulty) !== target) {
        console.error(`Block ${i} doesn't meet difficulty requirement`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get the entire blockchain
   * @returns Array of all blocks
   */
  getChain(): Block[] {
    return this.chain;
  }

  /**
   * Get a block by its index
   * @param index - Block index
   * @returns Block or undefined if not found
   */
  getBlockByIndex(index: number): Block | undefined {
    return this.chain[index];
  }

  /**
   * Get all blocks for a specific election
   * @param electionId - Election ID
   * @returns Array of blocks
   */
  getBlocksByElection(electionId: string): Block[] {
    return this.chain.filter(block => block.data.electionId === electionId);
  }

  /**
   * Count votes for a specific candidate in an election
   * @param electionId - Election ID
   * @param candidateId - Candidate ID
   * @returns Number of votes
   */
  getVoteCount(electionId: string, candidateId: string): number {
    return this.chain.filter(
      block => 
        block.data.electionId === electionId && 
        block.data.candidateId === candidateId
    ).length;
  }

  /**
   * Get all unique candidates who received votes in an election
   * @param electionId - Election ID
   * @returns Array of candidate IDs
   */
  getCandidatesWithVotes(electionId: string): string[] {
    const candidates = new Set<string>();
    this.chain.forEach(block => {
      if (block.data.electionId === electionId && block.data.candidateId !== 'genesis') {
        candidates.add(block.data.candidateId);
      }
    });
    return Array.from(candidates);
  }

  /**
   * Get total number of votes in an election
   * @param electionId - Election ID
   * @returns Total vote count
   */
  getTotalVotes(electionId: string): number {
    return this.chain.filter(
      block => block.data.electionId === electionId && block.data.candidateId !== 'genesis'
    ).length;
  }
}

// Made with Bob
