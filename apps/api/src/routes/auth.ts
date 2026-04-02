import { Router, Request, Response } from 'express';
import type { Router as ExpressRouter } from 'express';
import { storage } from '../services/storage';
import {
  hashPassword,
  comparePassword,
  generateVoterId,
  generateToken,
} from '../utils/auth';
import type {
  Voter,
  VoterPublic,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  SuccessResponse,
} from '@voting-chain/types';

const router: ExpressRouter = Router();

/**
 * POST /api/auth/register
 * Register a new voter
 */
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password }: RegisterRequest = req.body;

  if (!name || !email || !password) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: name, email, password',
    });
    return;
  }

  // Check if email already exists
  const existingVoter = storage.getVoterByEmail(email);
  if (existingVoter) {
    res.status(409).json({
      success: false,
      error: 'Email already registered',
    });
    return;
  }

  // Validate password strength
  if (password.length < 6) {
    res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long',
    });
    return;
  }

  try {
    const hashedPassword = await hashPassword(password);
    const voterId = generateVoterId();

    const voter: Voter = {
      id: voterId,
      name,
      email,
      passwordHash: hashedPassword,
      voterId: voterId,
      createdAt: new Date(),
      registeredAt: new Date(),
    };

    storage.createVoter(voter);

    const token = generateToken(voter);

    const voterPublic: VoterPublic = {
      id: voter.id,
      name: voter.name,
      email: voter.email,
      voterId: voter.voterId,
      registeredAt: voter.registeredAt,
    };

    const response: SuccessResponse<AuthResponse> = {
      success: true,
      data: {
        token,
        voter: voterPublic,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to register voter',
    });
  }
});

/**
 * POST /api/auth/login
 * Login a voter
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: email, password',
    });
    return;
  }

  const voter = storage.getVoterByEmail(email);

  if (!voter) {
    res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
    return;
  }

  try {
    const isPasswordValid = await comparePassword(password, voter.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken(voter);

    const voterPublic: VoterPublic = {
      id: voter.id,
      name: voter.name,
      email: voter.email,
      voterId: voter.voterId,
      registeredAt: voter.registeredAt,
    };

    const response: SuccessResponse<AuthResponse> = {
      success: true,
      data: {
        token,
        voter: voterPublic,
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to login',
    });
  }
});

export default router;

// Made with Bob
