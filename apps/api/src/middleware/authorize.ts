import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { storage } from '../services/storage';

/**
 * Middleware to authorize election creator actions
 * 
 * This middleware verifies that the authenticated user is the creator of the election
 * they are trying to modify. It should be used after the authenticate middleware
 * to protect routes that require election creator privileges.
 * 
 * The middleware checks:
 * 1. Election exists in the system
 * 2. The authenticated voter is the creator of the election
 * 
 * Election ID can be provided via:
 * - req.params.id (for routes like /elections/:id)
 * - req.body.electionId (for POST/PUT requests with election ID in body)
 * 
 * @param req - Express request object extended with voter information
 * @param res - Express response object
 * @param next - Express next function
 * 
 * @returns 404 if election not found
 * @returns 403 if user is not the election creator
 * @returns calls next() if authorization succeeds
 * 
 * @example
 * // Protect a route that modifies an election
 * router.put('/elections/:id', authenticate, authorizeElectionCreator, updateElection);
 * 
 * @example
 * // Protect a route that adds candidates to an election
 * router.post('/candidates', authenticate, authorizeElectionCreator, createCandidate);
 */
export function authorizeElectionCreator(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract election ID from params or body
    const electionId = req.params.id || req.body.electionId;

    if (!electionId) {
      res.status(400).json({
        success: false,
        error: 'Election ID is required',
      });
      return;
    }

    // Retrieve the election from storage
    const election = storage.getElection(electionId);

    if (!election) {
      res.status(404).json({
        success: false,
        error: 'Election not found',
      });
      return;
    }

    // Verify that the authenticated voter is the election creator
    if (election.createdBy !== req.voter!.voterId) {
      res.status(403).json({
        success: false,
        error: 'Only the election creator can perform this action',
      });
      return;
    }

    // Authorization successful, proceed to next middleware
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Authorization check failed',
    });
  }
}

// Made with Bob