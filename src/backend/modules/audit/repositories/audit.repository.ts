/**
 * Audit Repository Interface and In-Memory Implementation
 * Provides append-only, immutable storage for transfer audit events.
 */

export interface AuditEvent {
  id: string;
  transferId: string;
  action: string;
  actorId: string;
  actorRole: string;
  fromState: string | null;
  toState: string | null;
  ipAddress: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface IAuditRepository {
  create(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent>;
  findByTransferId(transferId: string): Promise<AuditEvent[]>;
}

export class InMemoryAuditRepository implements IAuditRepository {
  private events: AuditEvent[] = [];
  private sequence = 1;

  async create(payload: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<AuditEvent> {
    const newEvent: AuditEvent = {
      ...payload,
      id: `audit-${String(this.sequence++).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
      metadata: Object.freeze({ ...(payload.metadata || {}) }),
    };

    // Store frozen object to guarantee immutability
    this.events.push(Object.freeze(newEvent));
    return newEvent;
  }

  async findByTransferId(transferId: string): Promise<AuditEvent[]> {
    return this.events
      .filter((e) => e.transferId === transferId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  // Helper for test cleanup
  clear(): void {
    this.events = [];
    this.sequence = 1;
  }
}
