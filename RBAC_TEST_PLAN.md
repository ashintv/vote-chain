# RBAC Implementation Test Plan

This document provides comprehensive testing guidelines for the Role-Based Access Control (RBAC) implementation in the Voting Chain API. Since the API doesn't have a testing framework configured yet, this document serves as both a test specification and manual testing guide.

## Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Authorization Middleware Tests](#authorization-middleware-tests)
3. [Elections Authorization Tests](#elections-authorization-tests)
4. [Candidates Authorization Tests](#candidates-authorization-tests)
5. [Audit Service Tests](#audit-service-tests)
6. [Security Test Cases](#security-test-cases)
7. [Edge Cases and Error Handling](#edge-cases-and-error-handling)
8. [Manual Testing with cURL](#manual-testing-with-curl)
9. [Future Automated Test Implementation](#future-automated-test-implementation)

---

## Test Environment Setup

### Prerequisites

1. API server running on `http://localhost:3001`
2. At least two registered users (creator and non-creator)
3. Test election created by the first user
4. `jq` installed for JSON parsing (optional but recommended)

### Test Data Setup

```bash
# 1. Register two test users
USER1_EMAIL="creator@test.com"
USER1_PASSWORD="password123"
USER1_NAME="Election Creator"

USER2_EMAIL="voter@test.com"
USER2_PASSWORD="password123"
USER2_NAME="Regular Voter"

# 2. Store their tokens after login
TOKEN1="<creator-jwt-token>"
TOKEN2="<voter-jwt-token>"

# 3. Create a test election with USER1
ELECTION_ID="<test-election-id>"
```

---

## Authorization Middleware Tests

### Test Suite: `authorizeElectionCreator` Middleware

**File Location:** `voting-chain/apps/api/src/middleware/authorize.ts`

#### Test Case 1: Allow Election Creator to Proceed

**Scenario:** Authenticated user who created the election should be authorized

**Expected Behavior:**
- Middleware calls `next()` without errors
- Request proceeds to the route handler
- No error response sent

**Manual Test:**
```bash
# Create election as USER1
curl -X POST http://localhost:3001/api/elections \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Election",
    "description": "Test Description",
    "startTime": "2026-05-01T00:00:00Z",
    "endTime": "2026-05-31T23:59:59Z"
  }'

# Update status as creator (should succeed)
curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "active"
  }
}
```

---

#### Test Case 2: Block Non-Creator with 403 Forbidden

**Scenario:** Authenticated user who did NOT create the election should be denied

**Expected Behavior:**
- Middleware returns 403 status code
- Error message: "Only the election creator can perform this action"
- Request does not proceed to route handler

**Manual Test:**
```bash
# Try to update election status as USER2 (non-creator)
curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Only the election creator can perform this action"
}
```
**Expected Status:** `403 Forbidden`

---

#### Test Case 3: Return 404 When Election Doesn't Exist

**Scenario:** Request with non-existent election ID

**Expected Behavior:**
- Middleware returns 404 status code
- Error message: "Election not found"
- Request does not proceed to route handler

**Manual Test:**
```bash
# Try to update non-existent election
curl -X PATCH http://localhost:3001/api/elections/non-existent-id/status \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Election not found"
}
```
**Expected Status:** `404 Not Found`

---

#### Test Case 4: Return 400 When Election ID is Missing

**Scenario:** Request without election ID in params or body

**Expected Behavior:**
- Middleware returns 400 status code
- Error message: "Election ID is required"

**Note:** This scenario is primarily tested through route configuration validation.

---

#### Test Case 5: Handle Election ID from req.params.id

**Scenario:** Election ID provided via URL parameter (e.g., `/elections/:id`)

**Expected Behavior:**
- Middleware correctly extracts election ID from `req.params.id`
- Authorization check proceeds normally

**Manual Test:**
```bash
# PATCH /elections/:id/status uses req.params.id
curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

**Verification:** Check that authorization succeeds for creator

---

#### Test Case 6: Handle Election ID from req.body.electionId

**Scenario:** Election ID provided in request body (e.g., POST /candidates)

**Expected Behavior:**
- Middleware correctly extracts election ID from `req.body.electionId`
- Authorization check proceeds normally

**Manual Test:**
```bash
# POST /candidates uses req.body.electionId
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "Test Candidate",
    "party": "Test Party"
  }'
```

**Verification:** Check that authorization succeeds for creator

---

#### Test Case 7: Handle Errors Gracefully with 500 Status

**Scenario:** Unexpected error during authorization check

**Expected Behavior:**
- Middleware catches errors
- Returns 500 status code
- Error message: "Authorization check failed"

**Note:** This is best tested with unit tests that mock the storage service to throw errors.

---

## Elections Authorization Tests

### Test Suite: Elections Routes Authorization

**File Location:** `voting-chain/apps/api/src/routes/elections.ts`

#### Test Case 1: PATCH /elections/:id/status - Creator Can Update Status

**Scenario:** Election creator updates election status

**Expected Behavior:**
- Status update succeeds
- Audit log is created
- WebSocket event is broadcast
- Returns updated election data

**Manual Test:**
```bash
# Update election status as creator
curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "status": "active",
    "title": "Test Election"
  }
}
```

**Verification Steps:**
1. Check response status is 200
2. Verify `data.status` is "active"
3. Check console logs for audit entry
4. Verify WebSocket clients receive status change event

---

#### Test Case 2: PATCH /elections/:id/status - Non-Creator Receives 403

**Scenario:** Non-creator attempts to update election status

**Expected Behavior:**
- Request is denied with 403 status
- No status change occurs
- No audit log is created

**Manual Test:**
```bash
# Try to update as non-creator
curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Only the election creator can perform this action"
}
```
**Expected Status:** `403 Forbidden`

---

#### Test Case 3: PATCH /elections/:id/status - Unauthenticated User Receives 401

**Scenario:** Request without authentication token

**Expected Behavior:**
- Request is denied with 401 status
- Error message about missing/invalid token

**Manual Test:**
```bash
# Try to update without token
curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "No authentication token provided"
}
```
**Expected Status:** `401 Unauthorized`

---

#### Test Case 4: PATCH /elections/:id/status - Invalid Election ID Receives 404

**Scenario:** Request with non-existent election ID

**Expected Behavior:**
- Returns 404 status
- Error message: "Election not found"

**Manual Test:**
```bash
# Try to update non-existent election
curl -X PATCH http://localhost:3001/api/elections/invalid-id-12345/status \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Election not found"
}
```
**Expected Status:** `404 Not Found`

---

#### Test Case 5: Verify Audit Log is Created on Successful Status Change

**Scenario:** Successful status update creates audit log entry

**Expected Behavior:**
- Audit log entry is created with correct details
- Log includes: timestamp, action, userId, userName, electionId, old/new status, IP address

**Manual Test:**
```bash
# 1. Update election status
curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# 2. Check server console logs for audit entry
# Look for: [AUDIT] Election Status Changed:
```

**Expected Console Output:**
```json
[AUDIT] Election Status Changed: {
  "timestamp": "2026-04-02T09:30:00.000Z",
  "action": "ELECTION_STATUS_CHANGED",
  "userId": "creator-voter-id",
  "userName": "Election Creator",
  "electionId": "test-election-id",
  "details": {
    "oldStatus": "created",
    "newStatus": "active"
  },
  "ipAddress": "::1"
}
```

**Verification:**
- Audit log contains all required fields
- Timestamp is current
- User details match authenticated user
- Old and new status values are correct

---

## Candidates Authorization Tests

### Test Suite: Candidates Routes Authorization

**File Location:** `voting-chain/apps/api/src/routes/candidates.ts`

#### Test Case 1: POST /candidates - Creator Can Register Candidates

**Scenario:** Election creator registers a candidate for their election

**Expected Behavior:**
- Candidate registration succeeds
- Audit log is created
- Returns created candidate data

**Manual Test:**
```bash
# Register candidate as creator
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "John Doe",
    "party": "Independent",
    "description": "Experienced leader",
    "imageUrl": "https://example.com/john.jpg"
  }' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "electionId": "...",
    "name": "John Doe",
    "party": "Independent",
    "description": "Experienced leader",
    "imageUrl": "https://example.com/john.jpg",
    "registeredAt": "2026-04-02T09:30:00.000Z"
  }
}
```
**Expected Status:** `201 Created`

---

#### Test Case 2: POST /candidates - Non-Creator Receives 403

**Scenario:** Non-creator attempts to register a candidate

**Expected Behavior:**
- Request is denied with 403 status
- No candidate is created
- No audit log is created

**Manual Test:**
```bash
# Try to register candidate as non-creator
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "Jane Smith",
    "party": "Test Party"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Only the election creator can perform this action"
}
```
**Expected Status:** `403 Forbidden`

---

#### Test Case 3: POST /candidates - Unauthenticated User Receives 401

**Scenario:** Request without authentication token

**Expected Behavior:**
- Request is denied with 401 status
- Error message about missing/invalid token

**Manual Test:**
```bash
# Try to register candidate without token
curl -X POST http://localhost:3001/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "Jane Smith",
    "party": "Test Party"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "No authentication token provided"
}
```
**Expected Status:** `401 Unauthorized`

---

#### Test Case 4: POST /candidates - Invalid Election ID Receives 404

**Scenario:** Request with non-existent election ID

**Expected Behavior:**
- Returns 404 status
- Error message: "Election not found"

**Manual Test:**
```bash
# Try to register candidate for non-existent election
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "non-existent-election-id",
    "name": "Jane Smith",
    "party": "Test Party"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Election not found"
}
```
**Expected Status:** `404 Not Found`

---

#### Test Case 5: Verify Audit Log is Created on Successful Candidate Registration

**Scenario:** Successful candidate registration creates audit log entry

**Expected Behavior:**
- Audit log entry is created with correct details
- Log includes: timestamp, action, userId, userName, electionId, candidate details, IP address

**Manual Test:**
```bash
# 1. Register candidate
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "John Doe",
    "party": "Independent"
  }'

# 2. Check server console logs for audit entry
# Look for: [AUDIT] Candidate Registered:
```

**Expected Console Output:**
```json
[AUDIT] Candidate Registered: {
  "timestamp": "2026-04-02T09:30:00.000Z",
  "action": "CANDIDATE_REGISTERED",
  "userId": "creator-voter-id",
  "userName": "Election Creator",
  "electionId": "test-election-id",
  "details": {
    "candidateId": "candidate-uuid",
    "candidateName": "John Doe"
  },
  "ipAddress": "::1"
}
```

---

## Audit Service Tests

### Test Suite: Audit Service

**File Location:** `voting-chain/apps/api/src/services/audit.ts`

#### Test Case 1: Log Election Status Changes Correctly

**Scenario:** Audit service logs election status changes with all required fields

**Expected Behavior:**
- Log entry created with correct structure
- All fields populated correctly
- Timestamp is current
- Console output is formatted

**Expected Log Structure:**
```typescript
{
  timestamp: Date,
  action: "ELECTION_STATUS_CHANGED",
  userId: string,
  userName: string,
  electionId: string,
  details: {
    oldStatus: string,
    newStatus: string
  },
  ipAddress?: string
}
```

---

#### Test Case 2: Log Candidate Registrations Correctly

**Scenario:** Audit service logs candidate registrations with all required fields

**Expected Behavior:**
- Log entry created with correct structure
- All fields populated correctly
- Timestamp is current
- Console output is formatted

**Expected Log Structure:**
```typescript
{
  timestamp: Date,
  action: "CANDIDATE_REGISTERED",
  userId: string,
  userName: string,
  electionId: string,
  details: {
    candidateId: string,
    candidateName: string
  },
  ipAddress?: string
}
```

---

#### Test Case 3: Retrieve All Audit Logs

**Scenario:** Get all audit logs without filtering

**Expected Behavior:**
- Returns array of all audit logs
- Logs are in chronological order
- All log types are included

---

#### Test Case 4: Filter Audit Logs by Election ID

**Scenario:** Get audit logs for a specific election

**Expected Behavior:**
- Returns only logs for specified election
- Other election logs are excluded
- Empty array if no logs exist for election

---

#### Test Case 5: Handle Missing Optional Fields (ipAddress)

**Scenario:** Audit log created without IP address

**Expected Behavior:**
- Log is created successfully
- ipAddress field is undefined or omitted
- Other fields are populated correctly

---

#### Test Case 6: Format Timestamps Correctly

**Scenario:** Timestamps are created and formatted properly

**Expected Behavior:**
- Timestamp is a valid Date object
- Timestamp represents current time
- Timestamp is serializable to JSON

---

## Security Test Cases

### Test Suite: Security Vulnerabilities

#### Test Case 1: JWT Token Tampering

**Scenario:** Attempt to use a modified JWT token

**Expected Behavior:**
- Request is rejected with 401 status
- Error message: "Invalid or expired token"

**Manual Test:**
```bash
# Use a tampered token
TAMPERED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TAMPERED.SIGNATURE"

curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TAMPERED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Status:** `401 Unauthorized`

---

#### Test Case 2: Expired JWT Token

**Scenario:** Attempt to use an expired JWT token

**Expected Behavior:**
- Request is rejected with 401 status
- Error message: "Invalid or expired token"

---

#### Test Case 3: SQL Injection Attempt in Election ID

**Scenario:** Attempt SQL injection through election ID parameter

**Expected Behavior:**
- Request is handled safely
- No database errors
- Returns 404 for invalid ID

**Manual Test:**
```bash
# Try SQL injection patterns
curl -X PATCH "http://localhost:3001/api/elections/'; DROP TABLE elections; --/status" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Status:** `404 Not Found`

---

#### Test Case 4: XSS Attempt in Candidate Name

**Scenario:** Attempt to inject JavaScript in candidate name

**Expected Behavior:**
- Data is stored as-is (no execution)
- When retrieved, data is properly escaped
- No script execution in frontend

**Manual Test:**
```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "<script>alert(\"XSS\")</script>",
    "party": "Test"
  }'
```

**Verification:**
- Check that data is stored literally
- Verify frontend properly escapes the content

---

## Edge Cases and Error Handling

### Test Suite: Edge Cases

#### Test Case 1: Empty Request Body

**Scenario:** POST/PATCH request with empty body

**Expected Behavior:**
- Returns 400 status
- Error message about missing required fields

**Manual Test:**
```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n"
```

---

#### Test Case 2: Malformed JSON

**Scenario:** Request with invalid JSON syntax

**Expected Behavior:**
- Returns 400 status
- Error message about JSON parsing

---

#### Test Case 3: Adding Candidates to Non-Pending Election

**Scenario:** Attempt to add candidate to active/completed election

**Expected Behavior:**
- Returns 400 status
- Error message: "Cannot add candidates to an election that is not pending"

**Manual Test:**
```bash
# 1. First, set election to active
curl -X PATCH http://localhost:3001/api/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# 2. Try to add candidate
curl -X POST http://localhost:3001/api/candidates \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "Late Candidate",
    "party": "Test"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected Status:** `400 Bad Request`

---

## Manual Testing with cURL

### Complete Test Workflow

#### Step 1: Setup Test Environment

```bash
# Set API base URL
API_URL="http://localhost:3001/api"

# Register first user (creator)
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "password123",
    "name": "Election Creator"
  }' | jq

# Register second user (voter)
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "voter@test.com",
    "password": "password123",
    "name": "Regular Voter"
  }' | jq
```

---

#### Step 2: Authenticate Users

```bash
# Login as creator
CREATOR_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "password123"
  }')

TOKEN1=$(echo $CREATOR_RESPONSE | jq -r '.data.token')
echo "Creator Token: $TOKEN1"

# Login as voter
VOTER_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "voter@test.com",
    "password": "password123"
  }')

TOKEN2=$(echo $VOTER_RESPONSE | jq -r '.data.token')
echo "Voter Token: $TOKEN2"
```

---

#### Step 3: Create Test Election

```bash
# Create election as creator
ELECTION_RESPONSE=$(curl -s -X POST $API_URL/elections \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "RBAC Test Election",
    "description": "Testing authorization controls",
    "startTime": "2026-05-01T00:00:00Z",
    "endTime": "2026-05-31T23:59:59Z"
  }')

ELECTION_ID=$(echo $ELECTION_RESPONSE | jq -r '.data.id')
echo "Election ID: $ELECTION_ID"
```

---

#### Step 4: Test Authorization Scenarios

```bash
# Test 1: Creator can update status (should succeed)
echo "Test 1: Creator updates status"
curl -X PATCH $API_URL/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}' | jq

# Test 2: Non-creator cannot update status (should fail with 403)
echo "Test 2: Non-creator tries to update status"
curl -X PATCH $API_URL/elections/$ELECTION_ID/status \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}' \
  -w "\nHTTP Status: %{http_code}\n" | jq

# Test 3: Unauthenticated request (should fail with 401)
echo "Test 3: Unauthenticated request"
curl -X PATCH $API_URL/elections/$ELECTION_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}' \
  -w "\nHTTP Status: %{http_code}\n" | jq

# Test 4: Creator can register candidates (should succeed)
echo "Test 4: Creator registers candidate"
curl -X POST $API_URL/candidates \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "John Doe",
    "party": "Independent",
    "description": "Test candidate"
  }' | jq

# Test 5: Non-creator cannot register candidates (should fail with 403)
echo "Test 5: Non-creator tries to register candidate"
curl -X POST $API_URL/candidates \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "electionId": "'$ELECTION_ID'",
    "name": "Jane Smith",
    "party": "Test Party"
  }' \
  -w "\nHTTP Status: %{http_code}\n" | jq
```

---

### Test Results Checklist

Use this checklist to track test execution:

- [ ] Authorization middleware allows creator to proceed
- [ ] Authorization middleware blocks non-creator with 403
- [ ] Authorization middleware returns 404 for non-existent election
- [ ] Authorization middleware handles election ID from params
- [ ] Authorization middleware handles election ID from body
- [ ] Creator can update election status
- [ ] Non-creator receives 403 when updating election status
- [ ] Unauthenticated user receives 401 when updating election status
- [ ] Invalid election ID receives 404
- [ ] Audit log created on status change
- [ ] Creator can register candidates
- [ ] Non-creator receives 403 when registering candidates
- [ ] Unauthenticated user receives 401 when registering candidates
- [ ] Audit log created on candidate registration
- [ ] Audit service logs contain all required fields
- [ ] Audit service handles missing optional fields
- [ ] Security: JWT tampering is rejected
- [ ] Security: Expired tokens are rejected
- [ ] Security: SQL injection attempts are handled
- [ ] Security: XSS attempts are handled
- [ ] Edge case: Empty request body is handled
- [ ] Edge case: Malformed JSON is handled
- [ ] Edge case: Cannot add candidates to non-pending election

---

## Future Automated Test Implementation

When setting up a testing framework (Jest or Vitest), implement the following test files:

### 1. Install Testing Dependencies

```bash
cd voting-chain/apps/api
pnpm add -D jest @types/jest ts-jest supertest @types/supertest
```

### 2. Configure Jest

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ]
};
```

### 3. Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 4. Create Test Files

#### Authorization Middleware Tests

**File:** `voting-chain/apps/api/src/middleware/__tests__/authorize.test.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { authorizeElectionCreator } from '../authorize';
import { storage } from '../../services/storage';
import { AuthRequest } from '../auth';

jest.mock('../../services/storage');

describe('authorizeElectionCreator middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      voter: {
        voterId: 'creator-id',
        name: 'Creator',
        email: 'creator@test.com',
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow election creator to proceed', () => {
    mockRequest.params = { id: 'election-1' };
    const mockElection = {
      id: 'election-1',
      createdBy: 'creator-id',
    };
    (storage.getElection as jest.Mock).mockReturnValue(mockElection);

    authorizeElectionCreator(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should block non-creator with 403', () => {
    mockRequest.params = { id: 'election-1' };
    const mockElection = {
      id: 'election-1',
      createdBy: 'different-creator-id',
    };
    (storage.getElection as jest.Mock).mockReturnValue(mockElection);

    authorizeElectionCreator(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Only the election creator can perform this action',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 404 when election does not exist', () => {
    mockRequest.params = { id: 'non-existent' };
    (storage.getElection as jest.Mock).mockReturnValue(null);

    authorizeElectionCreator(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Election not found',
    });
  });

  it('should handle errors gracefully', () => {
    mockRequest.params = { id: 'election-1' };
    (storage.getElection as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    authorizeElectionCreator(
      mockRequest as AuthRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Authorization check failed',
    });
  });
});
```

---

#### Elections Routes Tests

**File:** `voting-chain/apps/api/src/routes/__tests__/elections.auth.test.ts`

```typescript
import request from 'supertest';
import express from 'express';
import electionsRouter from '../elections';
import { storage } from '../../services/storage';
import { auditService } from '../../services/audit';
import { generateToken } from '../../utils/auth';

jest.mock('../../services/storage');
jest.mock('../../services/audit');
jest.mock('../../services/websocket');

describe('Elections Authorization', () => {
  let app: express.Application;
  let creatorToken: string;
  let voterToken: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/elections', electionsRouter);

    creatorToken = generateToken({
      voterId: 'creator-id',
      name: 'Creator',
      email: 'creator@test.com',
    });

    voterToken = generateToken({
      voterId: 'voter-id',
      name: 'Voter',
      email: 'voter@test.com',
    });
  });

  describe('PATCH /elections/:id/status', () => {
    it('should allow creator to update status', async () => {
      const mockElection = {
        id: 'test-id',
        status: 'created',
        createdBy: 'creator-id',
      };
      (storage.getElection as jest.Mock).mockReturnValue(mockElection);
      (storage.updateElection as jest.Mock).mockReturnValue({
        ...mockElection,
        status: 'active',
      });

      const response = await request(app)
        .patch('/api/elections/test-id/status')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ status: 'active' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(auditService.logElectionStatusChange).toHaveBeenCalled();
    });

    it('should deny non-creator with 403', async () => {
      const mockElection = {
        id: 'test-id',
        createdBy: 'creator-id',
      };
      (storage.getElection as jest.Mock).mockReturnValue(mockElection);

      const response = await request(app)
        .patch('/api/elections/test-id/status')
        .set('Authorization', `Bearer ${voterToken}`)
        .send({ status: 'active' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
```

---

#### Audit Service Tests

**File:** `voting-chain/apps/api/src/services/__tests__/audit.test.ts`

```typescript
import { auditService } from '../audit';

describe('Audit Service', () => {
  beforeEach(() => {
    auditService.clear();
  });

  describe('logElectionStatusChange', () => {
    it('should log election status changes correctly', () => {
      auditService.logElectionStatusChange(
        'user-1',
        'Test User',
        'election-1',
        'created',
        'active',
        '127.0.0.1'
      );

      const logs = auditService.getAllAuditLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        action: 'ELECTION_STATUS_CHANGED',
        userId: 'user-1',
        userName: 'Test User',
        electionId: 'election-1',
        details: {
          oldStatus: 'created',
          newStatus: 'active',
        },
        ipAddress: '127.0.0.1',
      });
      expect(logs[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getAuditLogs', () => {
    it('should filter logs by election ID', () => {
      auditService.logElectionStatusChange(
        'user-1',
        'User',
        'election-1',
        'created',
        'active'
      );
      auditService.logElectionStatusChange(
        'user-1',
        'User',
        'election-2',
        'created',
        'active'
      );

      const logs = auditService.getAuditLogs('election-1');
      expect(logs).toHaveLength(1);
      expect(logs[0].electionId).toBe('election-1');
    });
  });
});
```

---

## Summary

This test plan provides comprehensive coverage for the RBAC implementation including:

1. **Authorization Middleware Tests** - 7 test cases covering all authorization scenarios
2. **Elections Authorization Tests** - 5 test cases for election status updates
3. **Candidates Authorization Tests** - 5 test cases for candidate registration
4. **Audit Service Tests** - 6 test cases for audit logging functionality
5. **Security Test Cases** - 4 test cases for common vulnerabilities
6. **Edge Cases** - 3 test cases for error handling
7. **Manual Testing Guide** - Complete cURL-based testing workflow
8. **Future Implementation** - Jest/Vitest test file templates

All tests can be executed manually using the provided cURL commands until an automated testing framework is set up.