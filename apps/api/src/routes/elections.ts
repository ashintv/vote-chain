import { Router, Request, Response } from 'express';
import type { Router as ExpressRouter } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../services/storage';
import { blockchainService } from '../services/blockchain';
import { websocketService } from '../services/websocket';
import { auditService } from '../services/audit';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authorizeElectionCreator } from '../middleware/authorize';
import {
  ElectionStatus,
} from '@voting-chain/types';
import type {
  Election,
  ApiResponse,
  SuccessResponse,
} from '@voting-chain/types';

const router: ExpressRouter = Router();

/**
 * GET /api/elections
 * Get all elections
 */
router.get('/', (req: Request, res: Response) => {
  const elections = storage.getAllElections();
  const response: SuccessResponse<Election[]> = {
    success: true,
    data: elections,
  };
  res.json(response);
});

/**
 * GET /api/elections/:id
 * Get a specific election
 */
router.get('/:id', (req: Request, res: Response) => {
  const election = storage.getElection(req.params.id);

  if (!election) {
    res.status(404).json({
      success: false,
      error: 'Election not found',
    });
    return;
  }

  const response: SuccessResponse<Election> = {
    success: true,
    data: election,
  };
  res.json(response);
});

/**
 * POST /api/elections
 * Create a new election
 */
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  const { title, description, startTime, endTime } = req.body;

  if (!title || !startTime || !endTime) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields: title, startTime, endTime',
    });
    return;
  }

  const election: Election = {
    id: uuidv4(),
    title,
    description: description || '',
    startDate: new Date(startTime),
    endDate: new Date(endTime),
    startTime: new Date(startTime).getTime(),
    endTime: new Date(endTime).getTime(),
    status: ElectionStatus.CREATED,
    createdAt: new Date(),
    createdBy: req.voter!.voterId,
  };

  storage.createElection(election);
  websocketService.broadcastElectionCreated(election.id, election.title);

  const response: SuccessResponse<Election> = {
    success: true,
    data: election,
  };
  res.status(201).json(response);
});

/**
 * PATCH /api/elections/:id/status
 * Update election status
 */
router.patch('/:id/status', authenticate, authorizeElectionCreator, (req: AuthRequest, res: Response) => {
  const election = storage.getElection(req.params.id);

  if (!election) {
    res.status(404).json({
      success: false,
      error: 'Election not found',
    });
    return;
  }

  const { status } = req.body;

  if (!status || !['pending', 'active', 'completed', 'cancelled'].includes(status)) {
    res.status(400).json({
      success: false,
      error: 'Invalid status. Must be: pending, active, completed, or cancelled',
    });
    return;
  }

  const previousStatus = election.status;
  const updated = storage.updateElection(election.id, { status });

  if (updated) {
    websocketService.broadcastElectionStatusChanged(
      election.id,
      status,
      previousStatus
    );

    // Log the status change to audit log
    auditService.logElectionStatusChange(
      req.voter!.voterId,
      req.voter!.name,
      election.id,
      previousStatus,
      status,
      req.ip
    );
  }

  const response: SuccessResponse<Election> = {
    success: true,
    data: updated!,
  };
  res.json(response);
});

/**
 * GET /api/elections/:id/results
 * Get election results
 */
router.get('/:id/results', (req: Request, res: Response) => {
  const election = storage.getElection(req.params.id);

  if (!election) {
    res.status(404).json({
      success: false,
      error: 'Election not found',
    });
    return;
  }

  const results = blockchainService.getElectionResults(req.params.id);

  res.json({
    success: true,
    data: results,
  });
});

export default router;

// Made with Bob
