/**
 * Operations Frontend API Client
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 */

export interface OperationalTask {
  id: string;
  category: 'IT' | 'FACILITIES' | 'PAYROLL';
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTeam: string;
  completedAt: string | null;
  notes: string | null;
  completedBy: string | null;
}

export interface OperationalTasksResponse {
  transferId: string;
  isAllCompleted: boolean;
  tasks: OperationalTask[];
}

export interface UpdateTaskPayload {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  completedBy?: string;
}

export interface UpdateTaskResponse {
  taskId: string;
  category: string;
  status: string;
  completedAt: string | null;
  notes: string | null;
  remainingPendingTasksCount: number;
}

export interface CompleteTransferResponse {
  transferId: string;
  status: string;
  completedAt: string;
  message: string;
}

const BASE_URL = '/api/v1/transfers';

export const operationsApi = {
  async fetchTasks(transferId: string): Promise<OperationalTasksResponse> {
    const res = await fetch(`${BASE_URL}/${transferId}/operational-tasks`);
    if (!res.ok) {
      throw new Error(`Failed to fetch operational tasks for transfer ${transferId}`);
    }
    return res.json() as Promise<OperationalTasksResponse>;
  },

  async updateTask(
    transferId: string,
    taskId: string,
    payload: UpdateTaskPayload
  ): Promise<UpdateTaskResponse> {
    const res = await fetch(`${BASE_URL}/${transferId}/operational-tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      const message = data.message || (data.details ? data.details.join(', ') : 'Failed to update task');
      throw new Error(message);
    }

    return data as UpdateTaskResponse;
  },

  async completeTransfer(
    transferId: string,
    userRole: string = 'HR_ADMIN'
  ): Promise<CompleteTransferResponse> {
    const res = await fetch(`${BASE_URL}/${transferId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': userRole,
      },
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      const message = data.message || 'Failed to complete transfer';
      throw new Error(message);
    }

    return data as CompleteTransferResponse;
  },
};
