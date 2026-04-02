import type {
  Election,
  Candidate,
  Voter,
  Vote,
  VoteReceipt,
} from '@voting-chain/types';

/**
 * In-memory storage service for the voting system
 * In production, this would be replaced with a proper database
 */
class StorageService {
  private elections: Map<string, Election> = new Map();
  private candidates: Map<string, Candidate> = new Map();
  private voters: Map<string, Voter> = new Map();
  private votersByEmail: Map<string, Voter> = new Map();
  private votes: Map<string, Vote> = new Map();
  private voteReceipts: Map<string, VoteReceipt> = new Map();
  // Track which voters have voted in which elections
  private voterElectionVotes: Map<string, Set<string>> = new Map();

  // Election methods
  createElection(election: Election): Election {
    this.elections.set(election.id, election);
    return election;
  }

  getElection(id: string): Election | undefined {
    return this.elections.get(id);
  }

  getAllElections(): Election[] {
    return Array.from(this.elections.values());
  }

  updateElection(id: string, updates: Partial<Election>): Election | undefined {
    const election = this.elections.get(id);
    if (!election) return undefined;

    const updated = { ...election, ...updates };
    this.elections.set(id, updated);
    return updated;
  }

  // Candidate methods
  createCandidate(candidate: Candidate): Candidate {
    this.candidates.set(candidate.id, candidate);
    return candidate;
  }

  getCandidate(id: string): Candidate | undefined {
    return this.candidates.get(id);
  }

  getCandidatesByElection(electionId: string): Candidate[] {
    return Array.from(this.candidates.values()).filter(
      (c) => c.electionId === electionId
    );
  }

  // Voter methods
  createVoter(voter: Voter): Voter {
    this.voters.set(voter.id, voter);
    this.votersByEmail.set(voter.email, voter);
    return voter;
  }

  getVoter(id: string): Voter | undefined {
    return this.voters.get(id);
  }

  getVoterByEmail(email: string): Voter | undefined {
    return this.votersByEmail.get(email);
  }

  // Vote tracking methods
  hasVoted(voterId: string, electionId: string): boolean {
    const voterVotes = this.voterElectionVotes.get(voterId);
    return voterVotes ? voterVotes.has(electionId) : false;
  }

  recordVote(voterId: string, electionId: string, vote: Vote): void {
    this.votes.set(vote.id, vote);

    if (!this.voterElectionVotes.has(voterId)) {
      this.voterElectionVotes.set(voterId, new Set());
    }
    this.voterElectionVotes.get(voterId)!.add(electionId);
  }

  // Vote receipt methods
  createVoteReceipt(receipt: VoteReceipt): VoteReceipt {
    this.voteReceipts.set(receipt.receiptId, receipt);
    return receipt;
  }

  getVoteReceipt(receiptId: string): VoteReceipt | undefined {
    return this.voteReceipts.get(receiptId);
  }

  getVoteReceiptsByVoter(voterId: string): VoteReceipt[] {
    return Array.from(this.voteReceipts.values()).filter(
      (r) => r.voterId === voterId
    );
  }

  // Utility methods
  clear(): void {
    this.elections.clear();
    this.candidates.clear();
    this.voters.clear();
    this.votersByEmail.clear();
    this.votes.clear();
    this.voteReceipts.clear();
    this.voterElectionVotes.clear();
  }
}

export const storage = new StorageService();

// Made with Bob
