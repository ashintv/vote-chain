# RBAC Implementation Plan for Elections Module

**Document Version:** 1.0  
**Date:** April 2, 2026  
**Status:** Draft  
**Author:** Security & Architecture Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Security Analysis Summary](#security-analysis-summary)
3. [RBAC Design](#rbac-design)
4. [Technical Implementation Plan](#technical-implementation-plan)
5. [Database Schema](#database-schema)
6. [API Changes](#api-changes)
7. [Security Considerations](#security-considerations)
8. [Testing Strategy](#testing-strategy)
9. [Rollout Plan](#rollout-plan)
10. [Appendix](#appendix)

---

## Executive Summary

### Overview

This document outlines the implementation plan for Role-Based Access Control (RBAC) in the voting-chain elections module. The primary objective is to restrict critical election management operations to authorized users (election creators) while maintaining system security and data integrity.

### Critical Security Vulnerabilities Being Addressed

The current implementation has **critical authorization vulnerabilities** that allow any authenticated user to:

1. **Modify election status** - Any user can start, stop, or cancel elections they didn't create
2. **Register candidates** - Any user can add candidates to any election
3. **Access real-time results** - No restrictions on viewing sensitive election data
4. **Publish results** - Unauthorized result manipulation is possible

These vulnerabilities pose significant risks:
- **Election manipulation** by unauthorized parties
- **Data integrity compromise** through unauthorized candidate registration
- **Trust erosion** in the voting system
- **Compliance violations** with election security standards

### Expected Outcomes and Benefits

Upon successful implementation, the system will achieve:

- ✅ **Secure election management** - Only creators can manage their elections
- ✅ **Data integrity** - Protected candidate registration process
- ✅ **Audit compliance** - Complete logging of all privileged operations
- ✅ **User trust** - Transparent and secure election administration
- ✅ **Regulatory compliance** - Meets security standards for voting systems

---

## Security Analysis Summary

### Key Findings from Security Audit

#### Current State Analysis

**Authentication Status:** ✅ Implemented  
- JWT-based authentication is functional
- Token validation working correctly
- Session management in place

**Authorization Status:** ❌ Missing  
- No role-based access control
- No ownership verification
- All authenticated users have equal privileges

#### Critical Vulnerabilities Identified

| Vulnerability ID | Severity | Component | Description |
|-----------------|----------|-----------|-------------|
| **VULN-001** | 🔴 Critical | Election Status API | Any authenticated user can modify election status via `PATCH /api/elections/:id/status` |
| **VULN-002** | 🔴 Critical | Candidate Registration | Any authenticated user can register candidates via `POST /api/candidates` |
| **VULN-003** | 🟡 High | Results Access | No authorization checks on results endpoints |
| **VULN-004** | 🟡 High | Audit Logging | Missing audit trail for privileged operations |
| **VULN-005** | 🟠 Medium | Frontend Controls | UI shows management controls to all users |

#### Current State vs. Desired State

**Current State:**
```typescript
// elections.ts - Line 96
router.patch('/:id/status', authenticate, (req: AuthRequest, res: Response) => {
  // ❌ No authorization check - any authenticated user can modify
  const election = storage.getElection(req.params.id);
  // ... update logic
});
```

**Desired State:**
```typescript
// elections.ts - Line 96
router.patch('/:id/status', authenticate, authorizeElectionCreator, (req: AuthRequest, res: Response) => {
  // ✅ Authorization middleware verifies ownership
  const election = storage.getElection(req.params.id);
  // ... update logic
});
```

### Impact Assessment

| Area | Current Risk | Post-Implementation Risk |
|------|-------------|-------------------------|
| Election Manipulation | 🔴 Critical | 🟢 Low |
| Data Integrity | 🔴 Critical | 🟢 Low |
| Audit Compliance | 🟡 High | 🟢 Low |
| User Trust | 🟡 High | 🟢 Low |

---

## RBAC Design

### Role Hierarchy

The system implements a simple, effective role hierarchy:

```
┌─────────────────────────────────────┐
│         System Roles                │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Election Creator           │  │
│  │   (election.createdBy)       │  │
│  │                              │  │
│  │   Permissions:               │  │
│  │   • Start own elections      │  │
│  │   • Stop own elections       │  │
│  │   • Cancel own elections     │  │
│  │   • Register candidates      │  │
│  │   • Publish results          │  │
│  └──────────────────────────────┘  │
│              ▲                      │
│              │                      │
│  ┌──────────────────────────────┐  │
│  │   Authenticated Voter        │  │
│  │   (any logged-in user)       │  │
│  │                              │  │
│  │   Permissions:               │  │
│  │   • View elections           │  │
│  │   • Cast votes               │  │
│  │   • View results             │  │
│  │   • Create elections         │  │
│  └──────────────────────────────┘  │
│              ▲                      │
│              │                      │
│  ┌──────────────────────────────┐  │
│  │   Anonymous User             │  │
│  │   (not logged in)            │  │
│  │                              │  │
│  │   Permissions:               │  │
│  │   • View public elections    │  │
│  │   • View public results      │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Permission Matrix

| Action | Anonymous | Authenticated Voter | Election Creator |
|--------|-----------|-------------------|------------------|
| **View Elections** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Create Election** | ❌ No | ✅ Yes | ✅ Yes |
| **Start Election** | ❌ No | ❌ No | ✅ Own Only |
| **Stop Election** | ❌ No | ❌ No | ✅ Own Only |
| **Cancel Election** | ❌ No | ❌ No | ✅ Own Only |
| **Register Candidates** | ❌ No | ❌ No | ✅ Own Only |
| **Cast Vote** | ❌ No | ✅ Yes | ✅ Yes |
| **View Real-time Results** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Publish Results** | ❌ No | ❌ No | ✅ Own Only |

### Authorization Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Authorization Flow                        │
└─────────────────────────────────────────────────────────────┘

    Client Request
         │
         ▼
    ┌─────────────────┐
    │  API Endpoint   │
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  authenticate   │ ◄─── Verify JWT Token
    │   Middleware    │
    └────────┬────────┘
             │
             ├─── ❌ Invalid Token → 401 Unauthorized
             │
             ▼ ✅ Valid Token
    ┌─────────────────────────┐
    │ authorizeElectionCreator│
    │      Middleware         │
    └────────┬────────────────┘
             │
             ├─── 1. Fetch Election
             │
             ├─── ❌ Not Found → 404 Not Found
             │
             ▼ ✅ Found
    ┌─────────────────────────┐
    │  Ownership Check        │
    │  election.createdBy     │
    │  === req.voter.voterId  │
    └────────┬────────────────┘
             │
             ├─── ❌ Not Owner → 403 Forbidden
             │
             ▼ ✅ Owner
    ┌─────────────────┐
    │  Route Handler  │ ◄─── Execute Business Logic
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Audit Log      │ ◄─── Log Action
    └────────┬────────┘
             │
             ▼
    ┌─────────────────┐
    │  Response       │
    └─────────────────┘
```

---

## Technical Implementation Plan

### Phase 1: Authorization Middleware (Priority: 🔴 Critical)

**Timeline:** Week 1, Days 1-2  
**Effort:** 8 hours

#### Objective
Create reusable authorization middleware to verify election ownership.

#### Implementation Steps

1. **Create Authorization Middleware File**
   - Location: `/voting-chain/apps/api/src/middleware/authorize.ts`
   - Dependencies: Express, storage service, auth types

2. **Implement `authorizeElectionCreator` Middleware**

```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { storage } from '../services/storage';

/**
 * Middleware to authorize election creators
 * Verifies that the authenticated user is the creator of the election
 */
export function authorizeElectionCreator(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const electionId = req.params.id || req.body.electionId;

    if (!electionId) {
      res.status(400).json({
        success: false,
        error: 'Election ID is required',
      });
      return;
    }

    // Fetch the election
    const election = storage.getElection(electionId);

    if (!election) {
      res.status(404).json({
        success: false,
        error: 'Election not found',
      });
      return;
    }

    // Verify ownership
    if (election.createdBy !== req.voter?.voterId) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You do not have permission to modify this election',
      });
      return;
    }

    // Authorization successful - proceed to route handler
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authorization',
    });
  }
}
```

#### Testing Requirements
- ✅ Verify middleware blocks unauthorized users
- ✅ Verify middleware allows election creators
- ✅ Verify proper error responses (403, 404)
- ✅ Verify middleware handles missing election IDs

---

### Phase 2: API Endpoint Protection (Priority: 🔴 Critical)

**Timeline:** Week 1, Days 3-4  
**Effort:** 12 hours

#### Objective
Apply authorization middleware to all privileged election endpoints.

#### Implementation Steps

1. **Protect Election Status Endpoint**

**File:** `/voting-chain/apps/api/src/routes/elections.ts` (Line 96)

```typescript
import { authorizeElectionCreator } from '../middleware/authorize';

// Update status endpoint
router.patch(
  '/:id/status',
  authenticate,
  authorizeElectionCreator, // ✅ Add authorization
  (req: AuthRequest, res: Response) => {
    const election = storage.getElection(req.params.id);
    
    const { status } = req.body;

    if (!status || !['pending', 'active', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: pending, active, completed, or cancelled',
      });
      return;
    }

    const previousStatus = election!.status;
    const updated = storage.updateElection(election!.id, { status });

    if (updated) {
      websocketService.broadcastElectionStatusChanged(
        election!.id,
        status,
        previousStatus
      );
    }

    const response: SuccessResponse<Election> = {
      success: true,
      data: updated!,
    };
    res.json(response);
  }
);
```

2. **Protect Candidate Registration Endpoint**

**File:** `/voting-chain/apps/api/src/routes/candidates.ts` (Line 51)

```typescript
import { authorizeElectionCreator } from '../middleware/authorize';

// Register candidate endpoint
router.post(
  '/',
  authenticate,
  authorizeElectionCreator, // ✅ Add authorization
  (req: AuthRequest, res: Response) => {
    const { electionId, name, party, description, imageUrl } = req.body;

    if (!electionId || !name) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: electionId, name',
      });
      return;
    }

    const election = storage.getElection(electionId);

    if (election!.status !== ElectionStatus.CREATED) {
      res.status(400).json({
        success: false,
        error: 'Cannot add candidates to an election that is not pending',
      });
      return;
    }

    const candidate: Candidate = {
      id: uuidv4(),
      electionId,
      name,
      party: party || '',
      description: description || '',
      imageUrl: imageUrl || '',
      registeredAt: new Date(),
    };

    storage.createCandidate(candidate);

    const response: SuccessResponse<Candidate> = {
      success: true,
      data: candidate,
    };
    res.status(201).json(response);
  }
);
```

---

### Phase 3: Audit Logging (Priority: 🟡 High)

**Timeline:** Week 2, Days 1-3  
**Effort:** 16 hours

#### Objective
Implement comprehensive audit logging for all privileged operations.

#### Audit Log Format

```json
{
  "timestamp": "2026-04-02T09:30:00.000Z",
  "userId": "voter-123",
  "userName": "John Doe",
  "action": "ELECTION_STATUS_CHANGE",
  "resource": "election",
  "resourceId": "election-456",
  "details": {
    "electionTitle": "2026 Presidential Election",
    "oldStatus": "created",
    "newStatus": "active"
  },
  "ipAddress": "192.168.1.100"
}
```

---

### Phase 4: Frontend Authorization (Priority: 🟠 Medium)

**Timeline:** Week 2, Days 4-5  
**Effort:** 12 hours

#### Objective
Update frontend to respect authorization rules and provide appropriate UI feedback.

---

### Phase 5: Testing (Priority: 🟡 High)

**Timeline:** Week 3  
**Effort:** 24 hours

#### Test Coverage Goals

| Component | Target Coverage | Priority |
|-----------|----------------|----------|
| Authorization Middleware | 100% | 🔴 Critical |
| Protected Routes | 100% | 🔴 Critical |
| Audit Service | 95% | 🟡 High |
| Frontend Components | 85% | 🟠 Medium |
| Integration Tests | 90% | 🟡 High |

---

### Phase 6: Documentation & Audit (Priority: 🟠 Medium)

**Timeline:** Week 4  
**Effort:** 16 hours

---

## Database Schema

### Current Schema Analysis

The existing database schema **already supports** the RBAC implementation without modifications:

#### Election Model

```typescript
interface Election {
  id: string;                // Unique identifier
  title: string;             // Election title
  description: string;       // Election description
  startDate: Date;           // Start date
  endDate: Date;             // End date
  startTime: number;         // Start timestamp
  endTime: number;           // End timestamp
  status: ElectionStatus;    // Current status
  createdBy: string;         // ✅ Creator voter ID (RBAC key field)
  createdAt: Date;           // Creation timestamp
}
```

**Key Field for RBAC:** `createdBy`
- Stores the `voterId` of the user who created the election
- Automatically populated during election creation
- Used by authorization middleware to verify ownership

### No Schema Changes Required

✅ **Advantage:** The RBAC implementation can be deployed without database migrations or data updates.

---

## API Changes

### Modified Endpoints

#### 1. PATCH /api/elections/:id/status

**Changes:**
- ✅ Added `authorizeElectionCreator` middleware
- ✅ New error response: 403 Forbidden

**New Error Response:**
```json
{
  "success": false,
  "error": "Forbidden: You do not have permission to modify this election"
}
```

#### 2. POST /api/candidates

**Changes:**
- ✅ Added `authorizeElectionCreator` middleware
- ✅ New error response: 403 Forbidden

---

## Security Considerations

### Session Management and Token Validation

#### Current Implementation
- ✅ JWT-based authentication
- ✅ Token expiration (configurable)
- ✅ Secure token storage

### Rate Limiting Recommendations

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const privilegedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many privileged operations, please try again later',
});
```

---

## Testing Strategy

### Authorization Test Cases

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| AUTH-001 | Creator updates own election | ✅ 200 OK |
| AUTH-002 | Non-creator updates election | ❌ 403 Forbidden |
| AUTH-003 | Unauthenticated update attempt | ❌ 401 Unauthorized |
| AUTH-004 | Update non-existent election | ❌ 404 Not Found |
| AUTH-005 | Creator registers candidate | ✅ 201 Created |
| AUTH-006 | Non-creator registers candidate | ❌ 403 Forbidden |

---

## Rollout Plan

### Deployment Phases

**Phase 1: Development Environment** (Week 1)
- Deploy authorization middleware
- Test with development data
- Verify all test cases pass

**Phase 2: Staging Environment** (Week 2)
- Deploy to staging
- Conduct security audit
- Performance testing

**Phase 3: Production Deployment** (Week 3)
- Deploy during maintenance window
- Monitor audit logs
- Verify no unauthorized access attempts

### Success Metrics

- ✅ Zero unauthorized access attempts succeed
- ✅ All audit logs captured correctly
- ✅ Response time impact < 50ms
- ✅ 100% test coverage on critical paths

---

## Appendix

### Code Examples

See implementation sections above for complete code examples.

### Error Response Formats

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Forbidden: You do not have permission to modify this election"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Election not found"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

**Document End**