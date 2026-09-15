/**
 * Unit Test Suite: Downstream Operational Task Orchestration
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 * Test Cases: .ai-context/test_cases/operational-orchestration.test_cases.md
 * 
 * Tests cover:
 * - UT01 (AC1): Auto-generation of IT, Facilities, and Payroll tasks upon fulfillment
 * - UT02 (AC2): PATCH operational task to COMPLETED with notes and operator email
 * - UT03 (AC3): Reject transfer completion when tasks are still pending (400 IncompleteTasks)
 * - UT04 (AC4): Successfully complete transfer when 100% of tasks are COMPLETED
 * - UT05 (AC5): Atomically update employee active profile on completion
 * - Non-HR caller authorization rejection (403 Forbidden)
 */

import { OperationsService } from '../../../../src/backend/modules/operations/services/operations.service';
import { IOperationsRepository, OperationalTaskEntity } from '../../../../src/backend/modules/operations/repositories/operations.repository';
import { 
  ForbiddenError, 
  NotFoundError, 
  ValidationError, 
  AppError 
} from '../../../../src/backend/shared/errors';

describe('OperationsService - Downstream Operational Task Orchestration (TDD RED Phase)', () => {
  let operationsService: OperationsService;
  let mockRepository: jest.Mocked<IOperationsRepository>;

  const mockTransfer = {
    id: 'tr-9001',
    employeeId: 'emp-001',
    status: 'APPROVED',
    currentStage: 'FULFILLMENT',
    proposedDepartmentId: 'dept-102',
    proposedLocationId: 'loc-302',
    proposedRoleId: 'role-202',
  };

  const initialTasks: OperationalTaskEntity[] = [
    {
      id: 'task-it-01',
      transferId: 'tr-9001',
      category: 'IT',
      title: 'Provision Cloud Infrastructure Access & Laptop Reprovisioning',
      status: 'PENDING',
      assignedTeam: 'IT-Support-Bengaluru',
      completedAt: null,
      notes: null,
      completedBy: null,
    },
    {
      id: 'task-fac-01',
      transferId: 'tr-9001',
      category: 'FACILITIES',
      title: 'Allocate Bengaluru Desk Seating & Campus Access Badge',
      status: 'PENDING',
      assignedTeam: 'Facilities-Bengaluru',
      completedAt: null,
      notes: null,
      completedBy: null,
    },
    {
      id: 'task-pay-01',
      transferId: 'tr-9001',
      category: 'PAYROLL',
      title: 'Update Department Cost Center & Compensation Record',
      status: 'PENDING',
      assignedTeam: 'Finance-Payroll',
      completedAt: null,
      notes: null,
      completedBy: null,
    },
  ];

  beforeEach(() => {
    mockRepository = {
      findTransferById: jest.fn(),
      getTasksByTransferId: jest.fn(),
      findTaskById: jest.fn(),
      updateTask: jest.fn(),
      spawnInitialTasks: jest.fn(),
      completeTransferAndApplyProfile: jest.fn(),
      executeTransaction: jest.fn((cb: () => any) => cb()),
    };

    operationsService = new OperationsService(mockRepository);
  });

  describe('operational-orchestration.UT01 (AC1) — Auto-generate Operational Tasks', () => {
    it('should spawn IT, Facilities, and Payroll tasks when initializing fulfillment', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer as any);
      mockRepository.spawnInitialTasks.mockResolvedValue(initialTasks);
      mockRepository.getTasksByTransferId.mockResolvedValue(initialTasks);

      const result = await operationsService.initializeFulfillment('tr-9001');

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks.map((t: OperationalTaskEntity) => t.category)).toEqual(['IT', 'FACILITIES', 'PAYROLL']);
      expect(result.isAllCompleted).toBe(false);
      expect(mockRepository.spawnInitialTasks).toHaveBeenCalledWith('tr-9001');
    });
  });

  describe('operational-orchestration.UT02 (AC2) — Update Operational Task Status', () => {
    it('should update task status to COMPLETED with notes and operator timestamp', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer as any);
      mockRepository.findTaskById.mockResolvedValue(initialTasks[0]);

      const updatedTask: OperationalTaskEntity = {
        ...initialTasks[0],
        status: 'COMPLETED',
        completedAt: '2026-09-15T12:00:00.000Z',
        notes: 'AWS credentials generated and assigned to user.',
        completedBy: 'it.admin@intglobal.com',
      };
      mockRepository.updateTask.mockResolvedValue(updatedTask);
      mockRepository.getTasksByTransferId.mockResolvedValue([
        updatedTask,
        initialTasks[1],
        initialTasks[2],
      ]);

      const result = await operationsService.updateTask('tr-9001', 'task-it-01', {
        status: 'COMPLETED',
        notes: 'AWS credentials generated and assigned to user.',
        completedBy: 'it.admin@intglobal.com',
      });

      expect(result.taskId).toBe('task-it-01');
      expect(result.status).toBe('COMPLETED');
      expect(result.remainingPendingTasksCount).toBe(2);
      expect(result.completedAt).toBeDefined();
    });
  });

  describe('operational-orchestration.UT03 (AC3) — Reject Completion on Pending Tasks', () => {
    it('should reject closure with HTTP 400 IncompleteTasks if any task remains pending', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer as any);
      mockRepository.getTasksByTransferId.mockResolvedValue(initialTasks); // all pending

      await expect(
        operationsService.completeTransfer('tr-9001', 'hr-301', 'HR_ADMIN')
      ).rejects.toThrow(AppError);
    });
  });

  describe('operational-orchestration.UT04 (AC4) — Successfully Close Transfer When All Completed', () => {
    it('should complete transfer when 100% of operational tasks are COMPLETED', async () => {
      const allCompletedTasks: OperationalTaskEntity[] = initialTasks.map((t) => ({
        ...t,
        status: 'COMPLETED',
        completedAt: '2026-09-15T13:00:00.000Z',
      }));

      mockRepository.findTransferById.mockResolvedValue(mockTransfer as any);
      mockRepository.getTasksByTransferId.mockResolvedValue(allCompletedTasks);
      mockRepository.completeTransferAndApplyProfile.mockResolvedValue({
        transferId: 'tr-9001',
        status: 'COMPLETED',
        completedAt: '2026-09-15T13:05:00.000Z',
        message: 'Transfer closed successfully. Employee profile updated to target department and role.',
      });

      const result = await operationsService.completeTransfer('tr-9001', 'hr-301', 'HR_ADMIN');

      expect(result.status).toBe('COMPLETED');
      expect(result.transferId).toBe('tr-9001');
      expect(mockRepository.completeTransferAndApplyProfile).toHaveBeenCalledWith(
        'tr-9001',
        'emp-001',
        'dept-102',
        'role-202',
        'loc-302'
      );
    });
  });

  describe('operational-orchestration.UT05 (AC5) — Role Authorization & Profile Atomicity', () => {
    it('should throw ForbiddenError if caller is not an HR administrator', async () => {
      mockRepository.findTransferById.mockResolvedValue(mockTransfer as any);

      await expect(
        operationsService.completeTransfer('tr-9001', 'regular-user', 'EMPLOYEE')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError if transfer does not exist', async () => {
      mockRepository.findTransferById.mockResolvedValue(null);

      await expect(
        operationsService.getOperationalTasks('non-existent-tr')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
