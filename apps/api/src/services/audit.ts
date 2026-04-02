/**
 * Audit Log interface for tracking sensitive operations
 */
export interface AuditLog {
  /** When the action occurred */
  timestamp: Date;
  /** What action was performed (e.g., "ELECTION_STATUS_CHANGED", "CANDIDATE_REGISTERED") */
  action: string;
  /** Who performed the action (voter ID) */
  userId: string;
  /** User's name for readability */
  userName: string;
  /** Which election was affected */
  electionId: string;
  /** Additional context (old/new values, etc.) */
  details: any;
  /** Optional IP address for security tracking */
  ipAddress?: string;
}

/**
 * Audit logging service for tracking sensitive election management operations
 * Stores logs in memory and outputs to console for development visibility
 */
class AuditService {
  private logs: AuditLog[] = [];

  /**
   * Log an election status change
   * @param userId - ID of the user performing the action
   * @param userName - Name of the user performing the action
   * @param electionId - ID of the election being modified
   * @param oldStatus - Previous status of the election
   * @param newStatus - New status of the election
   * @param ipAddress - Optional IP address of the requester
   */
  logElectionStatusChange(
    userId: string,
    userName: string,
    electionId: string,
    oldStatus: string,
    newStatus: string,
    ipAddress?: string
  ): void {
    try {
      const log: AuditLog = {
        timestamp: new Date(),
        action: 'ELECTION_STATUS_CHANGED',
        userId,
        userName,
        electionId,
        details: {
          oldStatus,
          newStatus,
        },
        ipAddress,
      };

      this.logs.push(log);
      
      // Console logging for development visibility
      console.log('[AUDIT] Election Status Changed:', JSON.stringify(log, null, 2));
    } catch (error) {
      // Don't let logging errors break the application
      console.error('[AUDIT] Failed to log election status change:', error);
    }
  }

  /**
   * Log a candidate registration
   * @param userId - ID of the user performing the action
   * @param userName - Name of the user performing the action
   * @param electionId - ID of the election the candidate is registered for
   * @param candidateId - ID of the registered candidate
   * @param candidateName - Name of the registered candidate
   * @param ipAddress - Optional IP address of the requester
   */
  logCandidateRegistration(
    userId: string,
    userName: string,
    electionId: string,
    candidateId: string,
    candidateName: string,
    ipAddress?: string
  ): void {
    try {
      const log: AuditLog = {
        timestamp: new Date(),
        action: 'CANDIDATE_REGISTERED',
        userId,
        userName,
        electionId,
        details: {
          candidateId,
          candidateName,
        },
        ipAddress,
      };

      this.logs.push(log);
      
      // Console logging for development visibility
      console.log('[AUDIT] Candidate Registered:', JSON.stringify(log, null, 2));
    } catch (error) {
      // Don't let logging errors break the application
      console.error('[AUDIT] Failed to log candidate registration:', error);
    }
  }

  /**
   * Retrieve audit logs, optionally filtered by election
   * @param electionId - Optional election ID to filter logs
   * @returns Array of audit logs
   */
  getAuditLogs(electionId?: string): AuditLog[] {
    if (electionId) {
      return this.logs.filter((log) => log.electionId === electionId);
    }
    return this.logs;
  }

  /**
   * Get all audit logs
   * @returns Array of all audit logs
   */
  getAllAuditLogs(): AuditLog[] {
    return this.logs;
  }

  /**
   * Clear all audit logs (useful for testing)
   */
  clear(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const auditService = new AuditService();

// Made with Bob