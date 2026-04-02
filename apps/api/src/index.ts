import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config';
import { websocketService } from './services/websocket';

// Import routes
import authRoutes from './routes/auth';
import electionsRoutes from './routes/elections';
import candidatesRoutes from './routes/candidates';
import votesRoutes from './routes/votes';
import blockchainRoutes from './routes/blockchain';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionsRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/blockchain', blockchainRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

// Start server with error handling
server.listen(config.port, () => {
  console.log('='.repeat(50));
  console.log('🚀 Blockchain Voting System API Server');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 CORS origin: ${config.cors.origin}`);
  console.log(`⛓️  Blockchain difficulty: ${config.blockchain.difficulty}`);
  
  // Initialize WebSocket server AFTER HTTP server is listening
  try {
    websocketService.initialize(server);
    console.log(`🔌 WebSocket server initialized at ws://localhost:${config.port}`);
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket server:', error);
    console.error('WebSocket functionality will not be available');
  }
  
  console.log('='.repeat(50));
  console.log(`\n✅ Ready to accept connections at http://localhost:${config.port}`);
  console.log(`📚 API Documentation: http://localhost:${config.port}/health\n`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${config.port} is already in use.`);
    console.error('Please try one of the following:');
    console.error(`  1. Kill the process using port ${config.port}: lsof -ti:${config.port} | xargs kill -9`);
    console.error(`  2. Change the PORT in your .env file`);
    console.error(`  3. Wait a few seconds and try again\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Made with Bob
