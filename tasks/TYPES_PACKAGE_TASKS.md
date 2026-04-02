# Types Package - Detailed Tasks

## Service Overview
Shared TypeScript type definitions used across all packages and applications in the monorepo.

**Location**: `packages/types/`

---

## Task 1: Setup Types Package Structure

### Subtasks:

1. **Create Package Directory**
   ```bash
   mkdir -p packages/types/src
   ```

2. **Create `package.json`**
   - Package name: `@voting-chain/types`
   - Main entry: `./src/index.ts`
   - Types entry: `./src/index.ts`
   - Scripts: `build`, `check-types`
   - Dev dependencies: `typescript`, `@voting-chain/typescript-config`

3. **Create `tsconfig.json`**
   - Extend from `@voting-chain/typescript-config/base.json`
   - Enable declaration files
   - Set `outDir` to `dist`

4. **Create `src/index.ts`**
   - Main export file for all types

**Acceptance Criteria:**
- ✅ Package builds successfully
- ✅ Types are accessible from other packages
- ✅ No compilation errors

---

## Task 2: Define Election Types

### File: `packages/types/src/election.ts`

### Subtasks:

1. **Create Election Interface**
   ```typescript
   export interface Election {
     id: string;
     title: string;
     description: string;
     startDate: Date;
     endDate: Date;
     status: 'created' | 'active' | 'closed' | 'finalized';
     createdBy: string;
     createdAt: Date;
   }
   ```

2. **Create Candidate Interface**
   ```typescript
   export interface Candidate {
     id: string;
     electionId: string;
     name: string;
     party?: string;
     description?: string;
     imageUrl?: string;
   }
   ```

3. **Create Election Status Enum**
   ```typescript
   export enum ElectionStatus {
     CREATED = 'created',
     ACTIVE = 'active',
     CLOSED = 'closed',
     FINALIZED = 'finalized'
   }
   ```

4. **Create Election Creation DTO**
   ```typescript
   export interface CreateElectionRequest {
     title: string;
     description: string;
     startDate: Date;
     endDate: Date;
   }
   ```

5. **Create Candidate Creation DTO**
   ```typescript
   export interface CreateCandidateRequest {
     name: string;
     party?: string;
     description?: string;
     imageUrl?: string;
   }
   ```

**Acceptance Criteria:**
- ✅ All election-related types are defined
- ✅ Types include proper optional fields
- ✅ Status enum covers all states
- ✅ DTOs match API requirements

---

## Task 3: Define Voter Types

### File: `packages/types/src/voter.ts`

### Subtasks:

1. **Create Voter Interface (Full)**
   ```typescript
   export interface Voter {
     id: string;
     name: string;
     email: string;
     passwordHash: string;
     voterId: string;
     createdAt: Date;
   }
   ```

2. **Create VoterPublic Interface**
   ```typescript
   export interface VoterPublic {
     id: string;
     name: string;
     email: string;
     voterId: string;
   }
   ```
   - Excludes sensitive data like passwordHash

3. **Create Authentication Request Types**
   ```typescript
   export interface RegisterRequest {
     name: string;
     email: string;
     password: string;
   }

   export interface LoginRequest {
     email: string;
     password: string;
   }
   ```

4. **Create Authentication Response Type**
   ```typescript
   export interface AuthResponse {
     token: string;
     voter: VoterPublic;
   }
   ```

5. **Create Voter Utility Types**
   ```typescript
   export type VoterWithoutPassword = Omit<Voter, 'passwordHash'>;
   ```

**Acceptance Criteria:**
- ✅ Sensitive data is properly separated
- ✅ Auth types match API contracts
- ✅ Public types don't expose passwords
- ✅ Utility types are reusable

---

## Task 4: Define Vote Types

### File: `packages/types/src/vote.ts`

### Subtasks:

1. **Create Vote Interface**
   ```typescript
   export interface Vote {
     id: string;
     electionId: string;
     voterId: string;
     blockHash: string;
     timestamp: Date;
   }
   ```

2. **Create VoteReceipt Interface**
   ```typescript
   export interface VoteReceipt {
     electionId: string;
     candidateId: string;
     blockHash: string;
     blockIndex: number;
     timestamp: number;
   }
   ```

3. **Create CastVoteRequest Interface**
   ```typescript
   export interface CastVoteRequest {
     electionId: string;
     candidateId: string;
   }
   ```

4. **Create VoteVerification Interface**
   ```typescript
   export interface VoteVerification {
     valid: boolean;
     blockIndex: number;
     timestamp: number;
     electionId: string;
     candidateId: string;
   }
   ```

**Acceptance Criteria:**
- ✅ Vote tracking is complete
- ✅ Receipt provides verification data
- ✅ Request types match API
- ✅ Verification includes all needed info

---

## Task 5: Define Results Types

### File: `packages/types/src/results.ts`

### Subtasks:

1. **Create CandidateResult Interface**
   ```typescript
   export interface CandidateResult {
     candidate: Candidate;
     voteCount: number;
     percentage: number;
   }
   ```

2. **Create ElectionResults Interface**
   ```typescript
   export interface ElectionResults {
     electionId: string;
     candidates: CandidateResult[];
     totalVotes: number;
     status: ElectionStatus;
   }
   ```

3. **Create VoteStatistics Interface**
   ```typescript
   export interface VoteStatistics {
     totalVoters: number;
     votedCount: number;
     turnoutPercentage: number;
     votesByHour: { hour: number; count: number }[];
   }
   ```

**Acceptance Criteria:**
- ✅ Results include all necessary data
- ✅ Percentages are calculated fields
- ✅ Statistics support analytics
- ✅ Types support charting libraries

---

## Task 6: Define API Response Types

### File: `packages/types/src/api.ts`

### Subtasks:

1. **Create Generic API Response**
   ```typescript
   export interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: string;
     message?: string;
   }
   ```

2. **Create Paginated Response**
   ```typescript
   export interface PaginatedResponse<T> {
     data: T[];
     total: number;
     page: number;
     pageSize: number;
     totalPages: number;
   }
   ```

3. **Create Error Response**
   ```typescript
   export interface ErrorResponse {
     error: string;
     message: string;
     statusCode: number;
     timestamp: Date;
   }
   ```

4. **Create Success Response**
   ```typescript
   export interface SuccessResponse<T = any> {
     success: true;
     data: T;
     message?: string;
   }
   ```

**Acceptance Criteria:**
- ✅ Generic types work with any data
- ✅ Pagination supports UI components
- ✅ Error responses are consistent
- ✅ Success responses are type-safe

---

## Task 7: Define WebSocket Event Types

### File: `packages/types/src/events.ts`

### Subtasks:

1. **Create WebSocket Event Enum**
   ```typescript
   export enum WebSocketEvent {
     ELECTION_CREATED = 'election:created',
     ELECTION_STARTED = 'election:started',
     ELECTION_ENDED = 'election:ended',
     VOTE_CAST = 'vote:cast',
     BLOCK_MINED = 'block:mined',
     RESULTS_UPDATED = 'results:updated'
   }
   ```

2. **Create Event Payload Types**
   ```typescript
   export interface VoteCastEvent {
     electionId: string;
     blockIndex: number;
     timestamp: number;
   }

   export interface BlockMinedEvent {
     blockIndex: number;
     hash: string;
     timestamp: number;
   }

   export interface ResultsUpdatedEvent {
     electionId: string;
     results: ElectionResults;
   }
   ```

3. **Create Generic Event Type**
   ```typescript
   export interface WebSocketMessage<T = any> {
     event: WebSocketEvent;
     payload: T;
     timestamp: number;
   }
   ```

**Acceptance Criteria:**
- ✅ All events are typed
- ✅ Payloads match event types
- ✅ Generic message type works for all events
- ✅ Events support real-time updates

---

## Task 8: Define Blockchain Types

### File: `packages/types/src/blockchain.ts`

### Subtasks:

1. **Create Block Interface**
   ```typescript
   export interface BlockInfo {
     index: number;
     timestamp: number;
     hash: string;
     previousHash: string;
     nonce: number;
     data: BlockData;
   }
   ```

2. **Create BlockData Interface**
   ```typescript
   export interface BlockData {
     electionId: string;
     candidateId: string;
     voterHash: string;
     timestamp: number;
   }
   ```

3. **Create Chain Validation Types**
   ```typescript
   export interface ChainValidation {
     valid: boolean;
     errors: string[];
     blockCount: number;
   }
   ```

**Acceptance Criteria:**
- ✅ Block types match blockchain implementation
- ✅ Validation types support error reporting
- ✅ Types work with blockchain package

---

## Task 9: Create Package Exports

### File: `packages/types/src/index.ts`

### Subtasks:

1. **Export All Type Modules**
   ```typescript
   export * from './election';
   export * from './voter';
   export * from './vote';
   export * from './results';
   export * from './api';
   export * from './events';
   export * from './blockchain';
   ```

2. **Create Barrel Exports for Common Types**
   ```typescript
   export type {
     Election,
     Candidate,
     Voter,
     Vote,
     VoteReceipt
   } from './index';
   ```

**Acceptance Criteria:**
- ✅ All types are exported
- ✅ No circular dependencies
- ✅ Types can be imported from package root
- ✅ Tree-shaking works properly

---

## Task 10: Add Type Utilities

### File: `packages/types/src/utils.ts`

### Subtasks:

1. **Create Type Guards**
   ```typescript
   export function isElection(obj: any): obj is Election {
     return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
   }
   ```

2. **Create Type Converters**
   ```typescript
   export function toVoterPublic(voter: Voter): VoterPublic {
     const { passwordHash, ...publicData } = voter;
     return publicData;
   }
   ```

3. **Create Validation Helpers**
   ```typescript
   export function isValidEmail(email: string): boolean {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   }
   ```

**Acceptance Criteria:**
- ✅ Type guards work correctly
- ✅ Converters handle all cases
- ✅ Validation helpers are reusable
- ✅ No runtime errors

---

## Dependencies

**Required Packages:**
- `typescript`
- `@voting-chain/typescript-config`

**Consumed By:**
- `@voting-chain/blockchain`
- `@voting-chain/api`
- `@voting-chain/web`

---

## Estimated Effort

- **Task 1**: 30 minutes
- **Task 2**: 1 hour
- **Task 3**: 1 hour
- **Task 4**: 45 minutes
- **Task 5**: 45 minutes
- **Task 6**: 1 hour
- **Task 7**: 45 minutes
- **Task 8**: 30 minutes
- **Task 9**: 15 minutes
- **Task 10**: 1 hour

**Total**: ~7.5 hours (1 day)

---

## Success Metrics

1. ✅ All packages can import types without errors
2. ✅ TypeScript provides proper autocomplete
3. ✅ No type conflicts across packages
4. ✅ Types are well-documented with JSDoc
5. ✅ Type utilities prevent common errors