# API Service - Detailed Tasks

## Service Overview
Express.js REST API server with WebSocket support for real-time updates. Handles authentication, election management, voting, and blockchain integration.

**Location**: `apps/api/`

---

## Task 1: Setup API Server Structure

### Subtasks:

1. **Create Directory Structure**
   ```bash
   mkdir -p apps/api/src/{routes,controllers,middleware,services,models}
   ```

2. **Create `package.json`**
   - Package name: `@voting-chain/api`
   - Dependencies:
     - `express`, `cors`, `helmet`
     - `socket.io`
     - `jsonwebtoken`, `bcrypt`
     - `dotenv`
     - `@voting-chain/blockchain`, `@voting-chain/types`
   - Dev dependencies:
     - `tsx`, `typescript`, `@types/express`, `@types/cors`, `@types/jsonwebtoken`, `@types/bcrypt`
   - Scripts:
     - `dev`: `tsx watch src/server.ts`
     - `build`: `tsc`
     - `start`: `node dist/server.js`

3. **Create `tsconfig.json`**
   - Extend from `@voting-chain/typescript-config/base.json`
   - Set `outDir` to `dist`
   - Include `src/**/*`

4. **Create `.env.example`**
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:5173
   BLOCKCHAIN_DIFFICULTY=2
   ```

**Acceptance Criteria:**
- ✅ Server starts without errors
- ✅ TypeScript compilation works
- ✅ Environment variables load correctly
- ✅ Dependencies install successfully

---

## Task 2: Implement Server Setup

### File: `apps/api/src/server.ts`

### Subtasks:

1. **Import Dependencies**
   - Express, cors, helmet
   - HTTP server, Socket.io
   - Blockchain from `@voting-chain/blockchain`
   - Route modules

2. **Initialize Express App**
   - Create Express instance
   - Create HTTP server
   - Initialize Socket.io with CORS

3. **Initialize Blockchain**
   ```typescript
   export const blockchain = new Blockchain(2);
   ```

4. **Configure Middleware**
   - `helmet()` for security headers
   - `cors()` with frontend URL
   - `express.json()` for JSON parsing
   - Make `io` available to routes via `app.set('io', io)`

5. **Register Routes**
   - `/api/auth` → authRoutes
   - `/api/elections` → electionRoutes
   - `/api/vote` → voteRoutes
   - `/api/blockchain` → blockchainRoutes

6. **Add Health Check**
   ```typescript
   app.get('/health', (req, res) => {
     res.json({ 
       status: 'ok', 
       blockchain: blockchain.isChainValid() 
     });
   });
   ```

7. **Setup WebSocket**
   - Handle connection/disconnection
   - Log client connections

8. **Start Server**
   - Listen on PORT from env
   - Log startup message with blockchain info

**Acceptance Criteria:**
- ✅ Server starts on specified port
- ✅ Health check returns 200
- ✅ CORS allows frontend requests
- ✅ WebSocket connections work
- ✅ Blockchain initializes with genesis block

---

## Task 3: Create Data Models

### File: `apps/api/src/models/data.ts`

### Subtasks:

1. **Create In-Memory Storage**
   ```typescript
   export const voters: Voter[] = [];
   export const elections: Election[] = [];
   export const candidates: Candidate[] = [];
   export const votes: Vote[] = [];
   ```

2. **Add Helper Functions**
   - `findVoterByEmail(email: string): Voter | undefined`
   - `findVoterById(id: string): Voter | undefined`
   - `findElectionById(id: string): Election | undefined`
   - `hasVoted(voterId: string, electionId: string): boolean`

3. **Add Seed Data (Optional)**
   - Create sample election
   - Create sample candidates
   - For testing purposes

**Acceptance Criteria:**
- ✅ Data structures are properly typed
- ✅ Helper functions work correctly
- ✅ Data persists during server runtime
- ✅ Seed data loads on startup (if enabled)

---

## Task 4: Implement Authentication Middleware

### File: `apps/api/src/middleware/auth.ts`

### Subtasks:

1. **Define JWT Secret**
   ```typescript
   const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
   ```

2. **Extend Request Interface**
   ```typescript
   export interface AuthRequest extends Request {
     voterId?: string;
   }
   ```

3. **Create `authenticateToken` Middleware**
   - Extract token from Authorization header
   - Verify token with JWT
   - Attach voterId to request
   - Return 401 if no token
   - Return 403 if invalid token

4. **Create `generateToken` Function**
   ```typescript
   export function generateToken(voterId: string): string {
     return jwt.sign({ voterId }, JWT_SECRET, { expiresIn: '24h' });
   }
   ```

5. **Create `hashPassword` Function**
   ```typescript
   export async function hashPassword(password: string): Promise<string> {
     return bcrypt.hash(password, 10);
   }
   ```

6. **Create `comparePassword` Function**
   ```typescript
   export async function comparePassword(
     password: string, 
     hash: string
   ): Promise<boolean> {
     return bcrypt.compare(password, hash);
   }
   ```

**Acceptance Criteria:**
- ✅ JWT tokens are generated correctly
- ✅ Token verification works
- ✅ Passwords are hashed with bcrypt
- ✅ Password comparison works
- ✅ Middleware protects routes

---

## Task 5: Implement Authentication Controller

### File: `apps/api/src/controllers/authController.ts`

### Subtasks:

1. **Create `register` Function**
   - Validate input (name, email, password)
   - Check if email already exists
   - Hash password
   - Generate unique voter ID
   - Create voter object
   - Save to voters array
   - Generate JWT token
   - Return token and voter data (without password)

2. **Create `login` Function**
   - Validate input (email, password)
   - Find voter by email
   - Compare password with hash
   - Generate JWT token
   - Return token and voter data

3. **Add Input Validation**
   - Email format validation
   - Password strength validation (min 8 chars)
   - Name validation (not empty)

4. **Add Error Handling**
   - Handle duplicate email
   - Handle invalid credentials
   - Handle validation errors

**Acceptance Criteria:**
- ✅ Registration creates new voter
- ✅ Login returns valid JWT
- ✅ Passwords are never returned
- ✅ Duplicate emails are rejected
- ✅ Invalid credentials return 401

---

## Task 6: Implement Authentication Routes

### File: `apps/api/src/routes/auth.ts`

### Subtasks:

1. **Create Router**
   ```typescript
   const router = express.Router();
   ```

2. **Define Routes**
   - `POST /register` → authController.register
   - `POST /login` → authController.login

3. **Export Router**
   ```typescript
   export default router;
   ```

**Acceptance Criteria:**
- ✅ Routes are accessible
- ✅ POST requests work
- ✅ Controllers are called correctly

---

## Task 7: Implement Election Service

### File: `apps/api/src/services/electionService.ts`

### Subtasks:

1. **Create `createElection` Function**
   - Generate unique ID
   - Set status to 'created'
   - Set createdAt timestamp
   - Validate dates (start < end)
   - Save to elections array
   - Return election

2. **Create `getAllElections` Function**
   - Return all elections
   - Optional: filter by status

3. **Create `getElectionById` Function**
   - Find election by ID
   - Return election or null

4. **Create `updateElectionStatus` Function**
   - Find election
   - Update status
   - Validate status transition
   - Return updated election

5. **Create `addCandidate` Function**
   - Generate unique ID
   - Validate election exists
   - Create candidate
   - Save to candidates array
   - Return candidate

6. **Create `getCandidatesByElection` Function**
   - Filter candidates by electionId
   - Return array of candidates

**Acceptance Criteria:**
- ✅ Elections can be created
- ✅ Elections can be retrieved
- ✅ Status updates work correctly
- ✅ Candidates can be added
- ✅ Candidates are linked to elections

---

## Task 8: Implement Election Controller

### File: `apps/api/src/controllers/electionController.ts`

### Subtasks:

1. **Create `createElection` Handler**
   - Extract data from request body
   - Call electionService.createElection
   - Return 201 with election data

2. **Create `getAllElections` Handler**
   - Call electionService.getAllElections
   - Return 200 with elections array

3. **Create `getElectionById` Handler**
   - Extract ID from params
   - Call electionService.getElectionById
   - Return 200 with election or 404

4. **Create `addCandidate` Handler**
   - Extract electionId from params
   - Extract candidate data from body
   - Call electionService.addCandidate
   - Return 201 with candidate

5. **Create `getCandidates` Handler**
   - Extract electionId from params
   - Call electionService.getCandidatesByElection
   - Return 200 with candidates array

6. **Create `getResults` Handler**
   - Extract electionId from params
   - Get candidates
   - Count votes from blockchain
   - Calculate percentages
   - Return results

**Acceptance Criteria:**
- ✅ All CRUD operations work
- ✅ Proper HTTP status codes
- ✅ Error handling is consistent
- ✅ Results calculation is accurate

---

## Task 9: Implement Election Routes

### File: `apps/api/src/routes/elections.ts`

### Subtasks:

1. **Create Router**

2. **Define Routes**
   - `GET /` → getAllElections
   - `GET /:id` → getElectionById
   - `POST /` → createElection (protected)
   - `GET /:id/candidates` → getCandidates
   - `POST /:id/candidates` → addCandidate (protected)
   - `GET /:id/results` → getResults

3. **Apply Authentication Middleware**
   - Protect POST routes with `authenticateToken`

**Acceptance Criteria:**
- ✅ All routes are accessible
- ✅ Protected routes require auth
- ✅ Public routes work without auth

---

## Task 10: Implement Vote Controller

### File: `apps/api/src/controllers/voteController.ts`

### Subtasks:

1. **Create `castVote` Function**
   - Extract voterId from auth request
   - Extract electionId, candidateId from body
   - Validate election exists and is active
   - Check if voter already voted
   - Hash voter ID for anonymity
   - Add vote to blockchain
   - Record vote in database
   - Create receipt
   - Emit WebSocket event
   - Return 201 with receipt

2. **Create `verifyVote` Function**
   - Extract block hash from params
   - Find block in blockchain
   - Verify block exists
   - Return verification data

3. **Add Validation**
   - Election must be active
   - Candidate must exist
   - Voter must not have voted

4. **Add Error Handling**
   - Handle invalid election
   - Handle duplicate vote
   - Handle blockchain errors

**Acceptance Criteria:**
- ✅ Votes are added to blockchain
- ✅ Double voting is prevented
- ✅ Receipts are generated
- ✅ WebSocket events are emitted
- ✅ Vote verification works

---

## Task 11: Implement Vote Routes

### File: `apps/api/src/routes/vote.ts`

### Subtasks:

1. **Create Router**

2. **Define Routes**
   - `POST /` → castVote (protected)
   - `GET /verify/:hash` → verifyVote

3. **Apply Authentication**
   - Protect POST route

**Acceptance Criteria:**
- ✅ Vote casting requires auth
- ✅ Verification is public
- ✅ Routes work correctly

---

## Task 12: Implement Blockchain Routes

### File: `apps/api/src/routes/blockchain.ts`

### Subtasks:

1. **Create Router**

2. **Define Routes**
   - `GET /` → getBlockchain
   - `GET /block/:index` → getBlock
   - `GET /validate` → validateChain

3. **Implement Handlers**
   - Return entire blockchain
   - Return specific block
   - Return validation result

**Acceptance Criteria:**
- ✅ Blockchain is accessible
- ✅ Individual blocks can be retrieved
- ✅ Validation endpoint works

---

## Task 13: Implement WebSocket Events

### File: `apps/api/src/services/websocketService.ts`

### Subtasks:

1. **Create Event Emitters**
   - `emitVoteCast(io, data)`
   - `emitBlockMined(io, data)`
   - `emitResultsUpdated(io, data)`
   - `emitElectionStatusChanged(io, data)`

2. **Integrate with Controllers**
   - Call emitters after vote cast
   - Call emitters after block mining
   - Call emitters after status changes

**Acceptance Criteria:**
- ✅ Events are emitted correctly
- ✅ Clients receive events
- ✅ Event data is properly formatted

---

## Task 14: Add Request Validation

### File: `apps/api/src/middleware/validation.ts`

### Subtasks:

1. **Create Validation Middleware**
   - `validateRegister`
   - `validateLogin`
   - `validateCreateElection`
   - `validateCastVote`

2. **Use Validation Library (Optional)**
   - Consider using `express-validator` or `joi`

3. **Add to Routes**
   - Apply validation before controllers

**Acceptance Criteria:**
- ✅ Invalid requests are rejected
- ✅ Error messages are clear
- ✅ Validation is consistent

---

## Task 15: Add Error Handling

### File: `apps/api/src/middleware/errorHandler.ts`

### Subtasks:

1. **Create Error Handler Middleware**
   ```typescript
   export function errorHandler(err, req, res, next) {
     console.error(err);
     res.status(err.statusCode || 500).json({
       error: err.message,
       ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
     });
   }
   ```

2. **Create Custom Error Classes**
   - `ValidationError`
   - `AuthenticationError`
   - `NotFoundError`

3. **Apply to Server**
   - Add as last middleware

**Acceptance Criteria:**
- ✅ Errors are caught and handled
- ✅ Error responses are consistent
- ✅ Stack traces in development only

---

## Dependencies

**Required Packages:**
- `express`, `cors`, `helmet`
- `socket.io`
- `jsonwebtoken`, `bcrypt`
- `dotenv`
- `@voting-chain/blockchain`
- `@voting-chain/types`

**Dev Dependencies:**
- `tsx`, `typescript`
- `@types/express`, `@types/cors`, `@types/jsonwebtoken`, `@types/bcrypt`, `@types/node`

---

## Estimated Effort

- **Task 1**: 1 hour
- **Task 2**: 2 hours
- **Task 3**: 1 hour
- **Task 4**: 2 hours
- **Task 5**: 2 hours
- **Task 6**: 30 minutes
- **Task 7**: 3 hours
- **Task 8**: 2 hours
- **Task 9**: 30 minutes
- **Task 10**: 3 hours
- **Task 11**: 30 minutes
- **Task 12**: 1 hour
- **Task 13**: 1.5 hours
- **Task 14**: 1.5 hours
- **Task 15**: 1 hour

**Total**: ~22 hours (3-4 days)

---

## Success Metrics

1. ✅ All API endpoints return correct responses
2. ✅ Authentication works securely
3. ✅ Votes are recorded in blockchain
4. ✅ Double voting is prevented
5. ✅ WebSocket events work in real-time
6. ✅ API handles errors gracefully
7. ✅ Response times < 200ms for most endpoints
8. ✅ Blockchain validation passes after 100+ votes