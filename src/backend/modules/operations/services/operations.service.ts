/**
 * Operations Domain Service Implementation
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 */

import { IOperationsRepository } from '../repositories/operations.repository';
import { validateUpdateTaskStatus } from '../validators/operations.validator';
import { NotFoundError, ForbiddenError, AppError } from '../../../shared/errors';

export class OperationsService {
  constructor(private readonly repository: IOperationsRepository) {}

  /**
   * Retrieves all downstream operational fulfillment tasks for a transfer request.
   */
  async getOperationalTasks(transferId: string) {
    const transfer = await this.repository.findTransferById(transferId);
    if (!transfer) {
      throw new NotFoundError('Transfer request not found');
    }

    const tasks = await this.repository.getTasksByTransferId(transferId);
    const isAllCompleted = tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');

    return {
      transferId,
      isAllCompleted,
      tasks,
    };
  }

  /**
   * Initializes fulfillment tasks upon stage entry.
   */
  async initializeFulfillment(transferId: string) {
    const transfer = await this.repository.findTransferById(transferId);
    if (!transfer) {
      throw new NotFoundError('Transfer request not found');
    }

    const tasks = await this.repository.spawnInitialTasks(transferId);
    const isAllCompleted = tasks.length > 0 && tasks.every((t) => t.status === 'COMPLETED');

    return {
      transferId,
      isAllCompleted,
      tasks,
    };
  }

  /**
   * Updates an operational task status, operator note, and completion timestamp.
   */
  async updateTask(transferId: string, taskId: string, input: unknown) {
    const payload = validateUpdateTaskStatus(input);

    const task = await this.repository.findTaskById(taskId);
    if (!task) {
      throw new NotFoundError('Operational task not found');
    }

    const now = new Date().toISOString();
    const updateData = {
      status: payload.status,
      notes: payload.notes || task.notes,
      completedBy: payload.completedBy || task.completedBy,
      completedAt: payload.status === 'COMPLETED' ? now : null,
    };

    const updated = await this.repository.updateTask(taskId, updateData);
    const allTasks = await this.repository.getTasksByTransferId(transferId);
    const remainingPendingTasksCount = allTasks.filter((t) => t.status !== 'COMPLETED').length;

    return {
      taskId: updated.id,
      category: updated.category,
      status: updated.status,
      completedAt: updated.completedAt,
      notes: updated.notes,
      remainingPendingTasksCount,
    };
  }

  /**
   * Finalizes transfer closure and applies profile changes atomically.
   */
  async completeTransfer(transferId: string, currentUserId: string, userRole?: string) {
    const isHrAdmin = userRole === 'HR_ADMIN' || currentUserId.startsWith('hr-');
    if (!isHrAdmin) {
      throw new ForbiddenError('Only HR Administrators can close transfers');
    }

    const transfer = await this.repository.findTransferById(transferId);
    if (!transfer) {
      throw new NotFoundError('Transfer request not found');
    }

    const tasks = await this.repository.getTasksByTransferId(transferId);
    const pendingCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

    if (pendingCount > 0) {
      throw new AppError(
        `Cannot finalize transfer: ${pendingCount} operational task(s) remain pending`,
        400
      );
    }

    return await this.repository.executeTransaction(async () => {
      return await this.repository.completeTransferAndApplyProfile(
        transferId,
        transfer.employeeId,
        transfer.proposedDepartmentId,
        transfer.proposedRoleId,
        transfer.proposedLocationId
      );
    });
  }
}
