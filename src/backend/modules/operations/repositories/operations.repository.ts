/**
 * Operational Tasks Repository Implementation & Interfaces
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 */

export interface OperationalTaskEntity {
  id: string;
  transferId: string;
  category: 'IT' | 'FACILITIES' | 'PAYROLL';
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTeam: string;
  completedAt: string | null;
  notes: string | null;
  completedBy: string | null;
}

export interface OperationsTransferRecord {
  id: string;
  employeeId: string;
  status: string;
  currentStage: string;
  proposedDepartmentId: string;
  proposedRoleId: string;
  proposedLocationId: string;
}

export interface IOperationsRepository {
  findTransferById(transferId: string): Promise<OperationsTransferRecord | null>;
  getTasksByTransferId(transferId: string): Promise<OperationalTaskEntity[]>;
  findTaskById(taskId: string): Promise<OperationalTaskEntity | null>;
  updateTask(taskId: string, updateData: Partial<OperationalTaskEntity>): Promise<OperationalTaskEntity>;
  spawnInitialTasks(transferId: string): Promise<OperationalTaskEntity[]>;
  completeTransferAndApplyProfile(
    transferId: string,
    employeeId: string,
    proposedDeptId: string,
    proposedRoleId: string,
    proposedLocId: string
  ): Promise<any>;
  executeTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export class InMemoryOperationsRepository implements IOperationsRepository {
  private transfers: Map<string, OperationsTransferRecord> = new Map([
    [
      'tr-9001',
      {
        id: 'tr-9001',
        employeeId: 'emp-001',
        status: 'APPROVED',
        currentStage: 'FULFILLMENT',
        proposedDepartmentId: 'dept-102',
        proposedRoleId: 'role-202',
        proposedLocationId: 'loc-302',
      },
    ],
  ]);

  private tasks: Map<string, OperationalTaskEntity[]> = new Map([
    [
      'tr-9001',
      [
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
          status: 'COMPLETED',
          assignedTeam: 'Facilities-Bengaluru',
          completedAt: '2026-09-15T12:30:00.000Z',
          notes: 'Desk 4B allocated and badge permissions granted.',
          completedBy: 'facilities.officer@intglobal.com',
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
      ],
    ],
  ]);

  async findTransferById(transferId: string): Promise<OperationsTransferRecord | null> {
    return this.transfers.get(transferId) || null;
  }

  async getTasksByTransferId(transferId: string): Promise<OperationalTaskEntity[]> {
    return this.tasks.get(transferId) || [];
  }

  async findTaskById(taskId: string): Promise<OperationalTaskEntity | null> {
    for (const list of this.tasks.values()) {
      const found = list.find((t) => t.id === taskId);
      if (found) return found;
    }
    return null;
  }

  async updateTask(
    taskId: string,
    updateData: Partial<OperationalTaskEntity>
  ): Promise<OperationalTaskEntity> {
    for (const list of this.tasks.values()) {
      const task = list.find((t) => t.id === taskId);
      if (task) {
        Object.assign(task, updateData);
        return task;
      }
    }
    throw new Error(`Task ${taskId} not found`);
  }

  async spawnInitialTasks(transferId: string): Promise<OperationalTaskEntity[]> {
    const existing = this.tasks.get(transferId);
    if (existing && existing.length > 0) return existing;

    const newTasks: OperationalTaskEntity[] = [
      {
        id: `task-it-${Date.now()}`,
        transferId,
        category: 'IT',
        title: 'Provision Cloud Infrastructure Access & Laptop Reprovisioning',
        status: 'PENDING',
        assignedTeam: 'IT-Support-Bengaluru',
        completedAt: null,
        notes: null,
        completedBy: null,
      },
      {
        id: `task-fac-${Date.now()}`,
        transferId,
        category: 'FACILITIES',
        title: 'Allocate Bengaluru Desk Seating & Campus Access Badge',
        status: 'PENDING',
        assignedTeam: 'Facilities-Bengaluru',
        completedAt: null,
        notes: null,
        completedBy: null,
      },
      {
        id: `task-pay-${Date.now()}`,
        transferId,
        category: 'PAYROLL',
        title: 'Update Department Cost Center & Compensation Record',
        status: 'PENDING',
        assignedTeam: 'Finance-Payroll',
        completedAt: null,
        notes: null,
        completedBy: null,
      },
    ];

    this.tasks.set(transferId, newTasks);
    return newTasks;
  }

  async completeTransferAndApplyProfile(
    transferId: string,
    _employeeId: string,
    _proposedDeptId: string,
    _proposedRoleId: string,
    _proposedLocId: string
  ): Promise<any> {
    const transfer = this.transfers.get(transferId);
    if (transfer) {
      transfer.status = 'COMPLETED';
      transfer.currentStage = 'COMPLETED';
    }

    return {
      transferId,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      message: 'Transfer closed successfully. Employee profile updated to target department and role.',
    };
  }

  async executeTransaction<T>(work: () => Promise<T>): Promise<T> {
    return await work();
  }
}
