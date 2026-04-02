import { Request, Response, NextFunction } from 'express';
import { extractToken, verifyToken } from '../utils/auth';

export interface AuthRequest extends Request {
  voter?: {
    voterId: string;
    name: string;
    email: string;
  };
}

/**
 * Middleware to authenticate requests using JWT
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
      return;
    }

    const decoded = verifyToken(token);
    req.voter = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

// Made with Bob
