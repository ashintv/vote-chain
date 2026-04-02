import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { WebSocketEvent } from '@voting-chain/types';
import type { WebSocketMessage } from '@voting-chain/types';

/**
 * WebSocket service for real-time updates
 */
class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      this.sendToClient(ws, {
        event: WebSocketEvent.ELECTION_CREATED,
        payload: { message: 'Connected to voting system' },
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Send message to a specific client
   */
  private sendToClient(ws: WebSocket, event: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(event: WebSocketMessage): void {
    const message = JSON.stringify(event);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Broadcast election created event
   */
  broadcastElectionCreated(electionId: string, electionName: string): void {
    this.broadcast({
      event: WebSocketEvent.ELECTION_CREATED,
      payload: { electionId, electionName },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast election status changed event
   */
  broadcastElectionStatusChanged(
    electionId: string,
    status: string,
    previousStatus: string
  ): void {
    this.broadcast({
      event: WebSocketEvent.ELECTION_STARTED,
      payload: { electionId, status, previousStatus },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast vote cast event
   */
  broadcastVoteCast(electionId: string, candidateId: string): void {
    this.broadcast({
      event: WebSocketEvent.VOTE_CAST,
      payload: { electionId, candidateId },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast results updated event
   */
  broadcastResultsUpdated(electionId: string): void {
    this.broadcast({
      event: WebSocketEvent.RESULTS_UPDATED,
      payload: { electionId },
      timestamp: Date.now(),
    });
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }
}

export const websocketService = new WebSocketService();

// Made with Bob
