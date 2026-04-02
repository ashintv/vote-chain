import { Router, Response } from 'express';
import type { Router as ExpressRouter } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { storage } from '../services/storage';
import { blockchainService } from '../services/blockchain';
import { websocketService } from '../services/websocket';
import { authenticate, AuthRequest } from '../middleware/auth';
import type {
  Vote,
  VoteReceipt,
  CastVoteRequest,
  SuccessResponse,
} from '@voting-chain/types';

const router: ExpressRouter = Router();

/**
 * POST /api/votes/cast
 * Cast a vote in an election
 */
router.post('/cast', authenticate, async (req: AuthRequest, res: Response) => {
  const { electionId, candidateId }: CastVoteRequest = req.body;
  const voterId = req.voter!.voterId;

  if (!electionId || !candidateId) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: electionId, candidateId',
    });
    return;
  }

  // Verify election exists and is active
  const election = storage.getElection(electionId);
  if (!election) {
    res.status(404).json({
      success: false,
      error: 'Election not found',
    });
    return;
  }

  if (election.status !== 'active') {
    res.status(400).json({
      success: false,
      error: 'Election is not active',
    });
    return;
  }

  // Check if election time is valid
  const now = Date.now();
  if (now < election.startTime || now > election.endTime) {
    res.status(400).json({
      success: false,
      error: 'Election is not within voting period',
    });
    return;
  }

  // Verify candidate exists and belongs to this election
  const candidate = storage.getCandidate(candidateId);
  if (!candidate || candidate.electionId !== electionId) {
    res.status(404).json({
      success: false,
      error: 'Candidate not found in this election',
    });
    return;
  }

  // Check if voter has already voted in this election
  if (storage.hasVoted(voterId, electionId)) {
    res.status(409).json({
      success: false,
      error: 'You have already voted in this election',
    });
    return;
  }

  try {
    // Hash the voter ID for anonymity
    const hashedVoterId = crypto
      .createHash('sha256')
      .update(voterId)
      .digest('hex');

    const voteId = uuidv4();
    const timestamp = Date.now();

    const vote: Vote = {
      id: voteId,
      electionId,
      voterId: voterId,
      candidateId,
      hashedVoterId,
      blockHash: '',
      timestamp,
    };

    // Add vote to blockchain
    blockchainService.addVote(vote);

    // Record vote in storage
    storage.recordVote(voterId, electionId, vote);

    // Generate receipt
    const receiptId = uuidv4();
    const receipt: VoteReceipt = {
      receiptId,
      voterId,
      electionId,
      candidateId,
      blockHash: '', // Will be filled after block is mined
      blockIndex: 0, // Will be filled after block is mined
      timestamp,
    };

    storage.createVoteReceipt(receipt);

    // Broadcast vote cast event
    websocketService.broadcastVoteCast(electionId, candidateId);
    websocketService.broadcastResultsUpdated(electionId);

    const response: SuccessResponse<VoteReceipt> = {
      success: true,
      data: receipt,
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cast vote',
    });
  }
});

/**
 * GET /api/votes/receipt/:receiptId
 * Get a vote receipt
 */
router.get('/receipt/:receiptId', authenticate, (req: AuthRequest, res: Response) => {
  const receipt = storage.getVoteReceipt(req.params.receiptId);

  if (!receipt) {
    res.status(404).json({
      success: false,
      error: 'Receipt not found',
    });
    return;
  }

  // Verify the receipt belongs to the requesting voter
  if (receipt.voterId !== req.voter!.voterId) {
    res.status(403).json({
      success: false,
      error: 'Access denied',
    });
    return;
  }

  const response: SuccessResponse<VoteReceipt> = {
    success: true,
    data: receipt,
  };

  res.json(response);
});

/**
 * GET /api/votes/my-receipts
 * Get all receipts for the authenticated voter
 */
router.get('/my-receipts', authenticate, (req: AuthRequest, res: Response) => {
  const receipts = storage.getVoteReceiptsByVoter(req.voter!.voterId);

  const response: SuccessResponse<VoteReceipt[]> = {
    success: true,
    data: receipts,
  };

  res.json(response);
});

export default router;

// Made with Bob
