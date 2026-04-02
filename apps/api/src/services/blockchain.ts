import { Blockchain } from '@voting-chain/blockchain';
import { config } from '../config';
import type { Vote, ElectionResults, CandidateResult } from '@voting-chain/types';
import { storage } from './storage';

/**
 * Blockchain service for managing the voting blockchain
 */
class BlockchainService {
  private blockchain: Blockchain;

  constructor() {
    this.blockchain = new Blockchain(config.blockchain.difficulty);
  }

  /**
   * Add a vote to the blockchain
   */
  addVote(vote: Vote): void {
    this.blockchain.addBlock({
      type: 'vote',
      electionId: vote.electionId,
      candidateId: vote.candidateId,
      voterHash: vote.hashedVoterId,
      timestamp: vote.timestamp,
    });
  }

  /**
   * Get election results from the blockchain
   */
  getElectionResults(electionId: string): ElectionResults {
    const candidates = storage.getCandidatesByElection(electionId);
    const totalVotes = this.blockchain.getTotalVotes(electionId);

    const results: CandidateResult[] = candidates.map((candidate) => {
      const voteCount = this.blockchain.getVoteCount(electionId, candidate.id);
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

      return {
        candidate: candidate,
        voteCount,
        percentage,
      };
    });

    // Sort by vote count descending
    results.sort((a, b) => b.voteCount - a.voteCount);

    const election = storage.getElection(electionId);

    return {
      electionId,
      results,
      candidates: results,
      totalVotes,
      status: election?.status || 'active' as any,
    };
  }

  /**
   * Verify blockchain integrity
   */
  isChainValid(): boolean {
    return this.blockchain.isChainValid();
  }

  /**
   * Get the entire blockchain
   */
  getChain() {
    return this.blockchain.getChain();
  }

  /**
   * Get blockchain info
   */
  getBlockchainInfo() {
    const chain = this.blockchain.getChain();
    return {
      length: chain.length,
      difficulty: config.blockchain.difficulty,
      isValid: this.blockchain.isChainValid(),
      latestBlock: chain[chain.length - 1],
    };
  }
}

export const blockchainService = new BlockchainService();

// Made with Bob
