import { Router, Request, Response } from 'express';
import type { Router as ExpressRouter } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../services/storage';
import { auditService } from '../services/audit';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorizeElectionCreator } from '../middleware/authorize';
import { ElectionStatus } from '@voting-chain/types';
import type { Candidate, SuccessResponse } from '@voting-chain/types';

const router: ExpressRouter = Router();

/**
 * GET /api/candidates/election/:electionId
 * Get all candidates for an election
 */
router.get('/election/:electionId', (req: Request, res: Response) => {
  const candidates = storage.getCandidatesByElection(req.params.electionId);

  const response: SuccessResponse<Candidate[]> = {
    success: true,
    data: candidates,
  };
  res.json(response);
});

/**
 * GET /api/candidates/:id
 * Get a specific candidate
 */
router.get('/:id', (req: Request, res: Response) => {
  const candidate = storage.getCandidate(req.params.id);

  if (!candidate) {
    res.status(404).json({
      success: false,
      error: 'Candidate not found',
    });
    return;
  }

  const response: SuccessResponse<Candidate> = {
    success: true,
    data: candidate,
  };
  res.json(response);
});

/**
 * POST /api/candidates
 * Register a new candidate
 */
router.post('/', authenticate, authorizeElectionCreator, (req: AuthRequest, res: Response) => {
  const { electionId, name, party, description, imageUrl } = req.body;

  if (!electionId || !name) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: electionId, name',
    });
    return;
  }

  // Verify election exists
  const election = storage.getElection(electionId);
  if (!election) {
    res.status(404).json({
      success: false,
      error: 'Election not found',
    });
    return;
  }

  // Check if election is still pending (can only add candidates to pending elections)
  if (election.status !== ElectionStatus.CREATED) {
    res.status(400).json({
      success: false,
      error: 'Cannot add candidates to an election that is not pending',
    });
    return;
  }

  const candidate: Candidate = {
    id: uuidv4(),
    electionId,
    name,
    party: party || '',
    description: description || '',
    imageUrl: imageUrl || '',
    registeredAt: new Date(),
  };

  storage.createCandidate(candidate);

  // Log the candidate registration to audit log
  auditService.logCandidateRegistration(
    req.voter!.voterId,
    req.voter!.name,
    electionId,
    candidate.id,
    candidate.name,
    req.ip
  );

  const response: SuccessResponse<Candidate> = {
    success: true,
    data: candidate,
  };
  res.status(201).json(response);
});

export default router;

// Made with Bob
