/**
 * Unit Test Suite: Transfer Request Initiation & Submission
 * Spec: .ai-context/specs/transfer-request-initiation.spec.md
 * Test Cases: .ai-context/test_cases/transfer-request-initiation.test_cases.md
 * 
 * Tests cover:
 * - UT01 (AC1): Employee transfer eligibility check
 * - UT02 (AC2): Successful transfer request submission
 * - UT03 (AC3): Duplicate active transfer conflict rejection
 * - UT04 (AC4): Same role/department assignment rejection
 * - UT05 (AC5): Invalid payload / past date validation rejection
 */

import { TransferService } from '../../../../src/backend/modules/transfers/services/transfer.service';
import { ITransferRepository } from '../../../../src/backend/modules/transfers/repositories/transfer.repository';
import { 
  ConflictError, 
  UnprocessableEntityError, 
  ValidationError, 
  NotFoundError 
} from '../../../../src/backend/shared/errors';

describe('TransferService - Transfer Request Initiation (TDD RED Phase)', () => {
  let transferService: TransferService;
  let mockRepository: jest.Mocked<ITransferRepository>;

  const mockEmployee = {
    id: 'emp-001',
    name: 'Alex Chen',
    email: 'alex.chen@intglobal.com',
    currentDepartmentId: 'dept-101',
    currentDepartmentName: 'Frontend Engineering',
    currentRoleId: 'role-201',
    currentRoleTitle: 'Software Engineer',
    currentLocationId: 'loc-301',
    currentLocationName: 'Kolkata HQ',
    tenureMonths: 18,
  };

  beforeEach(() => {
    mockRepository = {
      findEmployeeById: jest.fn(),
      findActiveTransferByEmployeeId: jest.fn(),
      getLookupData: jest.fn(),
      createTransferRequest: jest.fn(),
    };
    transferService = new TransferService(mockRepository);
  });

  describe('transfer-request-initiation.UT01 (AC1) — Check Employee Eligibility', () => {
    it('should return eligibility details when employee has no active transfer requests', async () => {
      mockRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockRepository.findActiveTransferByEmployeeId.mockResolvedValue(null);

      const result = await transferService.checkEligibility('emp-001');

      expect(result).toEqual({
        isEligible: true,
        hasActiveTransfer: false,
        activeTransferId: null,
        currentDepartment: {
          id: 'dept-101',
          name: 'Frontend Engineering',
        },
        currentRole: {
          id: 'role-201',
          title: 'Software Engineer',
        },
        currentLocation: {
          id: 'loc-301',
          name: 'Kolkata HQ',
        },
        tenureMonths: 18,
      });
      expect(mockRepository.findEmployeeById).toHaveBeenCalledWith('emp-001');
      expect(mockRepository.findActiveTransferByEmployeeId).toHaveBeenCalledWith('emp-001');
    });

    it('should throw NotFoundError if employee profile cannot be found', async () => {
      mockRepository.findEmployeeById.mockResolvedValue(null);

      await expect(transferService.checkEligibility('emp-999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('transfer-request-initiation.UT02 (AC2) — Submit Valid Transfer Request', () => {
    it('should successfully create a new transfer request in SUBMITTED state', async () => {
      mockRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockRepository.findActiveTransferByEmployeeId.mockResolvedValue(null);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 45);

      const validPayload = {
        proposedDepartmentId: 'dept-102',
        proposedLocationId: 'loc-302',
        proposedRoleId: 'role-202',
        effectiveDate: futureDate.toISOString(),
        transferReason: 'Relocation to Bengaluru for Cloud Infrastructure role',
        supportingDocumentUrls: ['https://storage.internal.intglobal.com/docs/cert.pdf'],
      };

      const createdRecord = {
        id: 'tr-9001',
        employeeId: 'emp-001',
        ...validPayload,
        status: 'SUBMITTED' as const,
        currentStage: 'CURRENT_MANAGER_REVIEW' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockRepository.createTransferRequest.mockResolvedValue(createdRecord);

      const result = await transferService.submitTransferRequest('emp-001', validPayload);

      expect(result.id).toBe('tr-9001');
      expect(result.status).toBe('SUBMITTED');
      expect(result.currentStage).toBe('CURRENT_MANAGER_REVIEW');
      expect(mockRepository.createTransferRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('transfer-request-initiation.UT03 (AC3) — Duplicate Active Transfer Conflict', () => {
    it('should reject submission with ConflictError when active transfer already exists', async () => {
      mockRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockRepository.findActiveTransferByEmployeeId.mockResolvedValue({
        id: 'tr-8999',
        employeeId: 'emp-001',
        status: 'IN_REVIEW',
      } as any);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const payload = {
        proposedDepartmentId: 'dept-102',
        proposedLocationId: 'loc-302',
        proposedRoleId: 'role-202',
        effectiveDate: futureDate.toISOString(),
      };

      await expect(
        transferService.submitTransferRequest('emp-001', payload)
      ).rejects.toThrow(ConflictError);

      expect(mockRepository.createTransferRequest).not.toHaveBeenCalled();
    });
  });

  describe('transfer-request-initiation.UT04 (AC4) — Reject Identical Role and Department', () => {
    it('should throw UnprocessableEntityError when proposed department and role match current assignment', async () => {
      mockRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockRepository.findActiveTransferByEmployeeId.mockResolvedValue(null);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const payload = {
        proposedDepartmentId: 'dept-101', // Same department
        proposedLocationId: 'loc-302',
        proposedRoleId: 'role-201',       // Same role
        effectiveDate: futureDate.toISOString(),
      };

      await expect(
        transferService.submitTransferRequest('emp-001', payload)
      ).rejects.toThrow(UnprocessableEntityError);

      expect(mockRepository.createTransferRequest).not.toHaveBeenCalled();
    });
  });

  describe('transfer-request-initiation.UT05 (AC5) — Validation Errors (Past Date / Payload Violations)', () => {
    it('should throw ValidationError when effectiveDate is in the past', async () => {
      mockRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockRepository.findActiveTransferByEmployeeId.mockResolvedValue(null);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const invalidPayload = {
        proposedDepartmentId: 'dept-102',
        proposedLocationId: 'loc-302',
        proposedRoleId: 'role-202',
        effectiveDate: pastDate.toISOString(),
      };

      await expect(
        transferService.submitTransferRequest('emp-001', invalidPayload)
      ).rejects.toThrow(ValidationError);

      expect(mockRepository.createTransferRequest).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when transferReason exceeds 1000 characters', async () => {
      mockRepository.findEmployeeById.mockResolvedValue(mockEmployee);
      mockRepository.findActiveTransferByEmployeeId.mockResolvedValue(null);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const invalidPayload = {
        proposedDepartmentId: 'dept-102',
        proposedLocationId: 'loc-302',
        proposedRoleId: 'role-202',
        effectiveDate: futureDate.toISOString(),
        transferReason: 'A'.repeat(1001),
      };

      await expect(
        transferService.submitTransferRequest('emp-001', invalidPayload)
      ).rejects.toThrow(ValidationError);
    });
  });
});
