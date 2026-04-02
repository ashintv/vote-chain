import { Router, Request, Response } from 'express';
import type { Router as ExpressRouter } from 'express';
import { blockchainService } from '../services/blockchain';
import type { SuccessResponse } from '@voting-chain/types';

const router: ExpressRouter = Router();

/**
 * GET /api/blockchain
 * Get the entire blockchain
 */
router.get('/', (req: Request, res: Response) => {
  const chain = blockchainService.getChain();

  res.json({
    success: true,
    data: chain,
  });
});

/**
 * GET /api/blockchain/info
 * Get blockchain information
 */
router.get('/info', (req: Request, res: Response) => {
  const info = blockchainService.getBlockchainInfo();

  res.json({
    success: true,
    data: info,
  });
});

/**
 * GET /api/blockchain/validate
 * Validate the blockchain integrity
 */
router.get('/validate', (req: Request, res: Response) => {
  const isValid = blockchainService.isChainValid();

  res.json({
    success: true,
    data: {
      isValid,
      message: isValid
        ? 'Blockchain is valid'
        : 'Blockchain integrity compromised',
    },
  });
});

export default router;

// Made with Bob
