# Blockchain Service - Detailed Tasks

## Service Overview
Custom blockchain implementation with proof-of-work consensus mechanism for storing votes immutably.

**Location**: `packages/blockchain/`

---

## Task 1: Setup Blockchain Package Structure

### Subtasks:
1. Create package directory structure
   ```bash
   mkdir -p packages/blockchain/src
   ```

2. Create `package.json`
   - Set package name: `@voting-chain/blockchain`
   - Add dependencies: `crypto` (built-in)
   - Add dev dependencies: `typescript`, `@voting-chain/typescript-config`
   - Add scripts: `build`, `dev`, `check-types`

3. Create `tsconfig.json`
   - Extend from `@voting-chain/typescript-config/base.json`
   - Set `outDir` to `dist`
   - Include `src/**/*`

4. Create `src/index.ts` as main export file

**Acceptance Criteria:**
- ✅ Package builds successfully with `pnpm build`
- ✅ TypeScript compilation works without errors
- ✅ Package can be imported by other workspaces

---

## Task 2: Implement Block Class

### File: `packages/blockchain/src/Block.ts`

### Subtasks:

1. **Define BlockData Interface**
   ```typescript
   interface BlockData {
     electionId: string;
     candidateId: string;
     voterHash: string;
     timestamp: number;
   }
   ```

2. **Create Block Class Structure**
   - Properties: `index`, `timestamp`, `data`, `previousHash`, `hash`, `nonce`
   - Constructor to initialize all properties
   - Set initial `nonce` to 0

3. **Implement `calculateHash()` Method**
   - Use SHA-256 hashing
   - Concatenate: index + previousHash + timestamp + JSON.stringify(data) + nonce
   - Return hex digest

4. **Implement `mineBlock(difficulty)` Method**
   - Create target string of zeros based on difficulty
   - Loop: increment nonce and recalculate hash until hash starts with target
   - Log when block is mined

5. **Add Type Exports**
   - Export `Block` class
   - Export `BlockData` interface

**Acceptance Criteria:**
- ✅ Block can be instantiated with required data
- ✅ Hash is calculated correctly using SHA-256
- ✅ Mining produces hash with correct number of leading zeros
- ✅ Each block has unique hash based on its content

**Test Cases:**
- Create block and verify hash format (64 hex characters)
- Mine block with difficulty 2, verify hash starts with "00"
- Change block data, verify hash changes
- Verify nonce increments during mining

---

## Task 3: Implement Blockchain Class

### File: `packages/blockchain/src/Blockchain.ts`

### Subtasks:

1. **Create Blockchain Class Structure**
   - Properties: `chain` (Block[]), `difficulty` (number)
   - Constructor with optional difficulty parameter (default: 2)

2. **Implement `createGenesisBlock()` Method**
   - Create first block with index 0
   - Use placeholder data: electionId='genesis', candidateId='genesis'
   - Set previousHash to '0'
   - Return genesis block

3. **Implement `getLatestBlock()` Method**
   - Return last block in chain array

4. **Implement `addBlock(data)` Method**
   - Create new block with:
     - index = chain.length
     - current timestamp
     - provided data
     - previousHash = latest block's hash
   - Mine the new block
   - Push to chain
   - Return the new block

5. **Implement `isChainValid()` Method**
   - Loop through chain starting from index 1
   - For each block:
     - Verify hash matches recalculated hash
     - Verify previousHash matches previous block's hash
   - Return true if all valid, false otherwise

6. **Implement Helper Methods**
   - `getBlockByIndex(index)`: Return block at specific index
   - `getBlocksByElection(electionId)`: Filter blocks by election
   - `getVoteCount(electionId, candidateId)`: Count votes for candidate

**Acceptance Criteria:**
- ✅ Blockchain initializes with genesis block
- ✅ New blocks can be added successfully
- ✅ Chain validation works correctly
- ✅ Tampering with any block invalidates the chain
- ✅ Helper methods return correct data

**Test Cases:**
- Initialize blockchain, verify genesis block exists
- Add 3 blocks, verify chain length is 4
- Validate chain, should return true
- Modify a block's data, validation should return false
- Get vote count for specific candidate

---

## Task 4: Create Package Exports

### File: `packages/blockchain/src/index.ts`

### Subtasks:

1. **Export Block Components**
   ```typescript
   export { Block, BlockData } from './Block';
   ```

2. **Export Blockchain Components**
   ```typescript
   export { Blockchain } from './Blockchain';
   ```

3. **Add Type Re-exports**
   - Ensure all types are accessible from package root

**Acceptance Criteria:**
- ✅ Can import `{ Block, Blockchain }` from `@voting-chain/blockchain`
- ✅ TypeScript types are available for consumers
- ✅ No circular dependency issues

---

## Task 5: Add Blockchain Utilities

### File: `packages/blockchain/src/utils.ts`

### Subtasks:

1. **Create Hash Utility Function**
   ```typescript
   export function hashData(data: string): string
   ```
   - Wrapper for SHA-256 hashing
   - Used for hashing voter IDs

2. **Create Difficulty Adjustment Function**
   ```typescript
   export function adjustDifficulty(blockchain: Blockchain, targetTime: number): number
   ```
   - Calculate average mining time
   - Increase/decrease difficulty based on target

3. **Create Block Verification Function**
   ```typescript
   export function verifyBlock(block: Block, previousBlock: Block): boolean
   ```
   - Standalone block verification
   - Check hash, previousHash, and proof-of-work

**Acceptance Criteria:**
- ✅ Hash utility produces consistent results
- ✅ Difficulty adjustment works based on mining time
- ✅ Block verification catches invalid blocks

---

## Task 6: Testing & Validation

### Subtasks:

1. **Unit Tests for Block Class**
   - Test hash calculation
   - Test mining with different difficulties
   - Test hash immutability

2. **Unit Tests for Blockchain Class**
   - Test genesis block creation
   - Test adding multiple blocks
   - Test chain validation
   - Test tampering detection

3. **Integration Tests**
   - Test complete voting flow
   - Test concurrent block additions
   - Test chain persistence

4. **Performance Tests**
   - Measure mining time for different difficulties
   - Test with large number of blocks (1000+)
   - Memory usage analysis

**Acceptance Criteria:**
- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ Mining time is acceptable (< 5 seconds for difficulty 2)
- ✅ No memory leaks detected

---

## Dependencies

**Required Packages:**
- `crypto` (Node.js built-in)
- `typescript`
- `@voting-chain/typescript-config`

**Consumed By:**
- `@voting-chain/api` (Express server)

---

## Estimated Effort

- **Task 1**: 30 minutes
- **Task 2**: 2 hours
- **Task 3**: 3 hours
- **Task 4**: 30 minutes
- **Task 5**: 1.5 hours
- **Task 6**: 2 hours

**Total**: ~9.5 hours (1-2 days)

---

## Success Metrics

1. ✅ Blockchain maintains integrity after 1000+ blocks
2. ✅ Chain validation completes in < 1 second for 1000 blocks
3. ✅ Mining time is predictable and adjustable
4. ✅ No blocks can be modified after addition
5. ✅ All votes are traceable and verifiable