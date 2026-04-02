# Implementation Guide - Blockchain Voting System

This guide provides detailed steps and code examples for implementing the blockchain-based election voting system.

## Phase 1: Project Setup & Structure

### Step 1: Create Required Directories

```bash
# From voting-chain root
mkdir -p apps/api/src/{routes,controllers,middleware,services,models}
mkdir -p packages/blockchain/src
mkdir -p packages/types/src
```

### Step 2: Update Turborepo Configuration

The existing `turbo.json` needs to be updated to include the API server:

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    }
  }
}
```

## Phase 2: Blockchain Implementation

### Block Class (`packages/blockchain/src/Block.ts`)

```typescript
import crypto from 'crypto';

export interface BlockData {
  electionId: string;
  candidateId: string;
  voterHash: string;
  timestamp: number;
}

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

  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    
    console.log(`Block mined: ${this.hash}`);
  }
}
```

### Blockchain Class (`packages/blockchain/src/Blockchain.ts`)

```typescript
import { Block, BlockData } from './Block';

export class Blockchain {
  public chain: Block[];
  public difficulty: number;

  constructor(difficulty: number = 2) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
  }

  private createGenesisBlock(): Block {
    return new Block(0, Date.now(), {
      electionId: 'genesis',
      candidateId: 'genesis',
      voterHash: 'genesis',
      timestamp: Date.now()
    }, '0');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

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

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block hash
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Verify link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    
    return true;
  }

  getBlockByIndex(index: number): Block | undefined {
    return this.chain[index];
  }

  getBlocksByElection(electionId: string): Block[] {
    return this.chain.filter(block => block.data.electionId === electionId);
  }

  getVoteCount(electionId: string, candidateId: string): number {
    return this.chain.filter(
      block => 
        block.data.electionId === electionId && 
        block.data.candidateId === candidateId
    ).length;
  }
}
```

### Package Configuration (`packages/blockchain/package.json`)

```json
{
  "name": "@voting-chain/blockchain",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "@voting-chain/typescript-config": "workspace:*",
    "typescript": "5.9.2"
  }
}
```

## Phase 3: Shared Types Package

### Type Definitions (`packages/types/src/index.ts`)

```typescript
// Election Types
export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'created' | 'active' | 'closed' | 'finalized';
  createdBy: string;
  createdAt: Date;
}

export interface Candidate {
  id: string;
  electionId: string;
  name: string;
  party?: string;
  description?: string;
  imageUrl?: string;
}

// Voter Types
export interface Voter {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  voterId: string; // Unique voter ID
  createdAt: Date;
}

export interface VoterPublic {
  id: string;
  name: string;
  email: string;
  voterId: string;
}

// Vote Types
export interface Vote {
  id: string;
  electionId: string;
  voterId: string;
  blockHash: string;
  timestamp: Date;
}

export interface VoteReceipt {
  electionId: string;
  candidateId: string;
  blockHash: string;
  blockIndex: number;
  timestamp: number;
}

// API Request/Response Types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  voter: VoterPublic;
}

export interface CastVoteRequest {
  electionId: string;
  candidateId: string;
}

export interface ElectionResults {
  electionId: string;
  candidates: Array<{
    candidate: Candidate;
    voteCount: number;
    percentage: number;
  }>;
  totalVotes: number;
}
```

## Phase 4: Express API Server

### Server Setup (`apps/api/src/server.ts`)

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import electionRoutes from './routes/elections';
import voteRoutes from './routes/vote';
import blockchainRoutes from './routes/blockchain';
import { Blockchain } from '@voting-chain/blockchain';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Initialize blockchain
export const blockchain = new Blockchain(2);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', blockchain: blockchain.isChainValid() });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Blockchain initialized with ${blockchain.chain.length} blocks`);
});
```

### Authentication Middleware (`apps/api/src/middleware/auth.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  voterId?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.voterId = decoded.voterId;
    next();
  });
};

export const generateToken = (voterId: string): string => {
  return jwt.sign({ voterId }, JWT_SECRET, { expiresIn: '24h' });
};
```

### Vote Controller (`apps/api/src/controllers/voteController.ts`)

```typescript
import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middleware/auth';
import { blockchain } from '../server';
import { CastVoteRequest, VoteReceipt } from '@voting-chain/types';
import { voters, votes, elections } from '../models/data';

export const castVote = async (req: AuthRequest, res: Response) => {
  try {
    const { electionId, candidateId } = req.body as CastVoteRequest;
    const voterId = req.voterId!;

    // Validate election exists and is active
    const election = elections.find(e => e.id === electionId);
    if (!election) {
      return res.status(404).json({ error: 'Election not found' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({ error: 'Election is not active' });
    }

    // Check if voter already voted in this election
    const existingVote = votes.find(
      v => v.electionId === electionId && v.voterId === voterId
    );

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted in this election' });
    }

    // Hash voter ID for anonymity in blockchain
    const voterHash = crypto
      .createHash('sha256')
      .update(voterId + electionId)
      .digest('hex');

    // Add vote to blockchain
    const block = blockchain.addBlock({
      electionId,
      candidateId,
      voterHash,
      timestamp: Date.now()
    });

    // Record vote in database
    const vote = {
      id: crypto.randomUUID(),
      electionId,
      voterId,
      blockHash: block.hash,
      timestamp: new Date()
    };
    votes.push(vote);

    // Create receipt
    const receipt: VoteReceipt = {
      electionId,
      candidateId,
      blockHash: block.hash,
      blockIndex: block.index,
      timestamp: block.timestamp
    };

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('vote:cast', { electionId, blockIndex: block.index });

    res.status(201).json({
      message: 'Vote cast successfully',
      receipt
    });
  } catch (error) {
    console.error('Error casting vote:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
};
```

## Phase 5: React Frontend Setup

### Vite Configuration (`apps/web/vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### API Client (`apps/web/src/services/api.ts`)

```typescript
import axios from 'axios';
import type { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse,
  CastVoteRequest,
  VoteReceipt,
  Election,
  ElectionResults
} from '@voting-chain/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: RegisterRequest) => 
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: LoginRequest) => 
    api.post<AuthResponse>('/auth/login', data),
};

export const electionAPI = {
  getAll: () => 
    api.get<Election[]>('/elections'),
  
  getById: (id: string) => 
    api.get<Election>(`/elections/${id}`),
  
  getResults: (id: string) => 
    api.get<ElectionResults>(`/elections/${id}/results`),
};

export const voteAPI = {
  cast: (data: CastVoteRequest) => 
    api.post<{ receipt: VoteReceipt }>('/vote', data),
  
  verify: (hash: string) => 
    api.get(`/vote/verify/${hash}`),
};

export default api;
```

## Phase 6: Key Dependencies

### API Server (`apps/api/package.json`)

```json
{
  "name": "@voting-chain/api",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@voting-chain/blockchain": "workspace:*",
    "@voting-chain/types": "workspace:*",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "socket.io": "^4.6.1",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^20.11.0",
    "tsx": "^4.7.0",
    "typescript": "5.9.2"
  }
}
```

### React App (`apps/web/package.json`)

```json
{
  "name": "@voting-chain/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@voting-chain/types": "workspace:*",
    "@voting-chain/ui": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.5",
    "socket.io-client": "^4.6.1",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.11",
    "typescript": "5.9.2"
  }
}
```

## Next Steps

After reviewing this plan, you can proceed to implementation by:

1. Setting up the project structure
2. Implementing the blockchain package
3. Creating the Express API
4. Building the React frontend
5. Testing and validation

Each phase can be tackled incrementally, with the blockchain core being the foundation for everything else.