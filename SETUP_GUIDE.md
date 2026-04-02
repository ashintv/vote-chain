# Setup Guide - Blockchain Voting System

This guide will walk you through setting up and running the blockchain-based election voting system.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher
- **pnpm**: v9.0.0 or higher
- **Git**: For version control

### Installing pnpm

```bash
npm install -g pnpm@9.0.0
```

## Initial Setup

### 1. Install Dependencies

From the project root (`voting-chain/`):

```bash
pnpm install
```

This will install all dependencies for all workspaces (apps and packages).

### 2. Environment Configuration

Create environment files for the API server:

```bash
# Create .env file in apps/api/
cd apps/api
touch .env
```

Add the following to `apps/api/.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Blockchain Configuration
BLOCKCHAIN_DIFFICULTY=2
```

Create environment file for the React app:

```bash
# Create .env file in apps/web/
cd ../web
touch .env
```

Add the following to `apps/web/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

## Development Workflow

### Running the Entire Stack

From the project root:

```bash
# Run all apps in development mode
pnpm dev
```

This will start:
- **API Server**: http://localhost:3001
- **React App**: http://localhost:5173
- **Docs** (if needed): http://localhost:3000

### Running Individual Apps

#### API Server Only

```bash
cd apps/api
pnpm dev
```

#### React App Only

```bash
cd apps/web
pnpm dev
```

### Building for Production

```bash
# Build all packages and apps
pnpm build

# Or build specific app
cd apps/api
pnpm build
```

## Project Structure Overview

```
voting-chain/
├── apps/
│   ├── api/              # Express API server
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── server.ts
│   │   ├── .env
│   │   └── package.json
│   │
│   └── web/              # React frontend
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── main.tsx
│       ├── .env
│       └── package.json
│
├── packages/
│   ├── blockchain/       # Blockchain implementation
│   ├── types/           # Shared TypeScript types
│   └── ui/              # Shared UI components
│
└── package.json
```

## Testing the System

### 1. Verify API Server

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "blockchain": true
}
```

### 2. Test Blockchain Endpoint

```bash
curl http://localhost:3001/api/blockchain
```

Should return the blockchain with genesis block.

### 3. Access React App

Open your browser and navigate to:
```
http://localhost:5173
```

## Common Development Tasks

### Adding a New Package

```bash
# Create new package directory
mkdir -p packages/new-package/src

# Create package.json
cd packages/new-package
pnpm init

# Add to workspace (already configured in pnpm-workspace.yaml)
```

### Adding Dependencies

```bash
# Add to specific workspace
pnpm add <package> --filter @voting-chain/api

# Add to all workspaces
pnpm add <package> -w

# Add dev dependency
pnpm add -D <package> --filter @voting-chain/web
```

### Type Checking

```bash
# Check types across all packages
pnpm check-types

# Check specific package
cd apps/api
pnpm check-types
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
cd apps/web
pnpm lint
```

## Troubleshooting

### Port Already in Use

If you get "Port already in use" errors:

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### pnpm Installation Issues

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### TypeScript Errors

```bash
# Rebuild all packages
pnpm build

# Clear TypeScript cache
rm -rf apps/*/tsconfig.tsbuildinfo
rm -rf packages/*/tsconfig.tsbuildinfo
```

### WebSocket Connection Issues

Ensure:
1. API server is running on port 3001
2. CORS is properly configured
3. Frontend URL matches in API .env file

## Development Tips

### Hot Reload

Both the API server and React app support hot reload:
- **API**: Uses `tsx watch` for automatic restart
- **React**: Uses Vite's HMR for instant updates

### Debugging

#### API Server

Add breakpoints in VS Code:

1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}/apps/api",
      "console": "integratedTerminal"
    }
  ]
}
```

#### React App

Use React DevTools browser extension and browser debugger.

### Database Persistence

Currently, the system uses in-memory storage. To add persistence:

1. Install database driver (e.g., PostgreSQL):
```bash
pnpm add pg --filter @voting-chain/api
pnpm add -D @types/pg --filter @voting-chain/api
```

2. Update models to use database instead of in-memory arrays

3. Add database connection configuration to `.env`

## API Testing with cURL

### Register a Voter

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Cast a Vote

```bash
curl -X POST http://localhost:3001/api/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "electionId": "election-id",
    "candidateId": "candidate-id"
  }'
```

### Get Election Results

```bash
curl http://localhost:3001/api/elections/election-id/results
```

## Production Deployment

### Environment Variables

Update production environment variables:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://your-domain.com
BLOCKCHAIN_DIFFICULTY=4
```

### Build Commands

```bash
# Build all packages
pnpm build

# Start production server
cd apps/api
node dist/server.js
```

### Deployment Checklist

- [ ] Update JWT_SECRET to a strong random value
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure database (if using persistent storage)
- [ ] Set up backup strategy for blockchain data
- [ ] Configure environment variables on hosting platform
- [ ] Test all endpoints in production environment
- [ ] Set up CI/CD pipeline

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3001/health
```

### Blockchain Validation

```bash
curl http://localhost:3001/api/blockchain/validate
```

### Logs

API server logs are output to console. In production, configure proper logging:

```bash
# Example with PM2
pm2 start dist/server.js --name voting-api --log-date-format "YYYY-MM-DD HH:mm:ss"
pm2 logs voting-api
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret in production
2. **Password Hashing**: bcrypt with 10 rounds (already configured)
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: Validate all user inputs
6. **CORS**: Configure strict CORS policies
7. **Environment Variables**: Never commit .env files to version control

## Next Steps

After setup:

1. Review the [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed code examples
3. Start implementing features following the todo list
4. Test thoroughly before deploying to production

## Getting Help

- Check existing documentation in the project
- Review code comments and type definitions
- Test API endpoints with provided cURL examples
- Use browser DevTools for frontend debugging

## Useful Commands Reference

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm check-types

# Linting
pnpm lint

# Format code
pnpm format

# Add dependency to specific package
pnpm add <package> --filter @voting-chain/<package-name>

# Remove dependency
pnpm remove <package> --filter @voting-chain/<package-name>

# Update all dependencies
pnpm update -r

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install