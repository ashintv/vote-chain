import axios from 'axios';
import type {
  Election,
  Candidate,
  VoterPublic,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  CastVoteRequest,
  VoteReceipt,
  ElectionResults,
  ApiResponse,
  SuccessResponse,
} from '@voting-chain/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<SuccessResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<SuccessResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },
};

// Elections API
export const electionsApi = {
  getAll: async (): Promise<Election[]> => {
    const response = await api.get<SuccessResponse<Election[]>>('/elections');
    return response.data.data;
  },

  getById: async (id: string): Promise<Election> => {
    const response = await api.get<SuccessResponse<Election>>(`/elections/${id}`);
    return response.data.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
  }): Promise<Election> => {
    const response = await api.post<SuccessResponse<Election>>('/elections', data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<Election> => {
    const response = await api.patch<SuccessResponse<Election>>(
      `/elections/${id}/status`,
      { status }
    );
    return response.data.data;
  },

  getResults: async (id: string): Promise<ElectionResults> => {
    const response = await api.get<SuccessResponse<ElectionResults>>(
      `/elections/${id}/results`
    );
    return response.data.data;
  },
};

// Candidates API
export const candidatesApi = {
  getByElection: async (electionId: string): Promise<Candidate[]> => {
    const response = await api.get<SuccessResponse<Candidate[]>>(
      `/candidates/election/${electionId}`
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Candidate> => {
    const response = await api.get<SuccessResponse<Candidate>>(`/candidates/${id}`);
    return response.data.data;
  },

  create: async (data: {
    electionId: string;
    name: string;
    party?: string;
    description?: string;
    imageUrl?: string;
  }): Promise<Candidate> => {
    const response = await api.post<SuccessResponse<Candidate>>('/candidates', data);
    return response.data.data;
  },
};

// Votes API
export const votesApi = {
  cast: async (data: CastVoteRequest): Promise<VoteReceipt> => {
    const response = await api.post<SuccessResponse<VoteReceipt>>('/votes/cast', data);
    return response.data.data;
  },

  getReceipt: async (receiptId: string): Promise<VoteReceipt> => {
    const response = await api.get<SuccessResponse<VoteReceipt>>(
      `/votes/receipt/${receiptId}`
    );
    return response.data.data;
  },

  getMyReceipts: async (): Promise<VoteReceipt[]> => {
    const response = await api.get<SuccessResponse<VoteReceipt[]>>('/votes/my-receipts');
    return response.data.data;
  },
};

// Blockchain API
export const blockchainApi = {
  getChain: async (): Promise<any[]> => {
    const response = await api.get<SuccessResponse<any[]>>('/blockchain');
    return response.data.data;
  },

  getInfo: async (): Promise<any> => {
    const response = await api.get<SuccessResponse<any>>('/blockchain/info');
    return response.data.data;
  },

  validate: async (): Promise<{ isValid: boolean; message: string }> => {
    const response = await api.get<
      SuccessResponse<{ isValid: boolean; message: string }>
    >('/blockchain/validate');
    return response.data.data;
  },
};

// Add convenience methods to the api instance
Object.assign(api, {
  // Blockchain methods
  getBlockchain: blockchainApi.getChain,
  validateBlockchain: blockchainApi.validate,
  getBlockchainInfo: blockchainApi.getInfo,
  
  // Elections methods
  getElections: electionsApi.getAll,
  getElection: electionsApi.getById,
  createElection: electionsApi.create,
  updateElectionStatus: electionsApi.updateStatus,
  getResults: electionsApi.getResults,
  
  // Candidates methods
  getCandidates: candidatesApi.getByElection,
  getCandidate: candidatesApi.getById,
  registerCandidate: candidatesApi.create,
  
  // Votes methods
  castVote: votesApi.cast,
  getVoteReceipt: votesApi.getReceipt,
  getMyReceipts: votesApi.getMyReceipts,
  
  // Auth methods
  register: authApi.register,
  login: authApi.login,
});

// Export both named and default
export { api };
export default api;

// Made with Bob
