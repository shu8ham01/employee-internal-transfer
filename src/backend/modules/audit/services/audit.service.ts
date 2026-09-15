/**
 * Audit Logging Service
 * Handles non-blocking, fail-safe immutable audit logging and zero-PII scrubbing.
 */

import { AuditEvent, IAuditRepository, InMemoryAuditRepository } from '../repositories/audit.repository';

export interface RecordEventInput {
  transferId: string;
  action: string;
  actorId: string;
  actorRole: string;
  fromState: string | null;
  toState: string | null;
  ipAddress: string;
  metadata?: Record<string, any> | null;
}

export interface AuditTrailResult {
  transferId: string;
  auditEvents: AuditEvent[];
}

const SENSITIVE_KEYS = new Set([
  'password',
  'ssn',
  'rawsalary',
  'salary',
  'token',
  'secret',
  'creditcard',
  'bankaccount',
]);

export class AuditService {
  constructor(private readonly repository: IAuditRepository = new InMemoryAuditRepository()) {}

  /**
   * Non-blocking, fail-safe recording of an audit event.
   * Strips out any unmasked PII fields from metadata before storage.
   */
  async recordEvent(input: RecordEventInput): Promise<AuditEvent> {
    try {
      const sanitizedMetadata = this.sanitizeMetadata(input.metadata);

      return await this.repository.create({
        transferId: input.transferId,
        action: input.action,
        actorId: input.actorId,
        actorRole: input.actorRole,
        fromState: input.fromState,
        toState: input.toState,
        ipAddress: input.ipAddress || '127.0.0.1',
        metadata: sanitizedMetadata,
      });
    } catch (error) {
      // Non-blocking fail-safe: log error to stderr without failing parent business operations
      // eslint-disable-next-line no-console
      console.error('Audit logging failed safely:', error);
      return {
        id: 'audit-fallback',
        transferId: input.transferId,
        action: input.action,
        actorId: input.actorId,
        actorRole: input.actorRole,
        fromState: input.fromState,
        toState: input.toState,
        ipAddress: input.ipAddress || '127.0.0.1',
        timestamp: new Date().toISOString(),
        metadata: {},
      };
    }
  }

  /**
   * Retrieves the full immutable audit trail for a transfer.
   */
  async getAuditTrail(transferId: string): Promise<AuditTrailResult> {
    const auditEvents = await this.repository.findByTransferId(transferId);
    return {
      transferId,
      auditEvents,
    };
  }

  /**
   * Recursively sanitizes metadata by removing blacklisted PII fields.
   */
  private sanitizeMetadata(metadata?: Record<string, any> | null): Record<string, any> {
    if (!metadata || typeof metadata !== 'object') {
      return {};
    }

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        continue; // Scrub sensitive field
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
