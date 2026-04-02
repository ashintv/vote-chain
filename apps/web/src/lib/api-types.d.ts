import type { AxiosInstance } from 'axios';
import type {
  Election,
  Candidate,
  VoteReceipt,
  ElectionResults,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  CastVoteRequest,
} from '@voting-chain/types';

declare module 'axios' {
  export interface AxiosInstance {
    // Blockchain methods
    getBlockchain(): Promise<any[]>;
    validateBlockchain(): Promise<{ isValid: boolean; message: string }>;
    getBlockchainInfo(): Promise<any>;
    
    // Elections methods
    getElections(): Promise<Election[]>;
    getElection(id: string): Promise<Election>;
    createElection(data: {
      title: string;
      description?: string;
      startTime: Date;
      endTime: Date;
    }): Promise<Election>;
    updateElectionStatus(id: string, status: string): Promise<Election>;
    getResults(id: string): Promise<ElectionResults>;
    
    // Candidates methods
    getCandidates(electionId: string): Promise<Candidate[]>;
    getCandidate(id: string): Promise<Candidate>;
    registerCandidate(data: {
      electionId: string;
      name: string;
      party?: string;
      description?: string;
      imageUrl?: string;
    }): Promise<Candidate>;
    
    // Votes methods
    castVote(data: CastVoteRequest): Promise<VoteReceipt>;
    getVoteReceipt(receiptId: string): Promise<VoteReceipt>;
    getMyReceipts(): Promise<VoteReceipt[]>;
    
    // Auth methods
    register(data: RegisterRequest): Promise<AuthResponse>;
    login(data: LoginRequest): Promise<AuthResponse>;
  }
}

// Made with Bob
