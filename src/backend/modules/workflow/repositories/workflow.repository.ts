/**
 * Workflow Repository Implementation & Interfaces
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 */

export interface TransferSummary {
  id: string;
  employeeId: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  currentStage: 'CURRENT_MANAGER_REVIEW' | 'HIRING_MANAGER_REVIEW' | 'HR_VALIDATION' | 'FULFILLMENT' | 'COMPLETED';
  currentManagerId: string;
  hiringManagerId: string;
  hrAdminId: string;
}

export interface ReviewerInfo {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface WorkflowStageEntity {
  id: string;
  stageName: string;
  stageOrder: number;
  assignedReviewer: ReviewerInfo;
  enteredAt: string;
  completedAt?: string;
  status?: string;
}

export interface WorkflowHistoryItem {
  stage: string;
  actor: string;
  action: string;
  timestamp: string;
  remarks: string;
}

export interface WorkflowStateResponse {
  transferId: string;
  status: string;
  currentStage: WorkflowStageEntity | null;
  completedStages: WorkflowStageEntity[];
  history: WorkflowHistoryItem[];
}

export interface RecordDecisionParams {
  transferId: string;
  actorId: string;
  action: string;
  remarks: string;
  targetReleaseDate?: string;
  nextStage?: string;
  nextStatus: string;
}

export interface IWorkflowRepository {
  findTransferById(transferId: string): Promise<TransferSummary | null>;
  getWorkflowState(transferId: string): Promise<WorkflowStateResponse | null>;
  findCurrentStage(transferId: string): Promise<WorkflowStageEntity | null>;
  recordDecisionAndAdvance(params: RecordDecisionParams): Promise<any>;
  executeTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export class InMemoryWorkflowRepository implements IWorkflowRepository {
  private transfers: Map<string, TransferSummary> = new Map([
    [
      'tr-9001',
      {
        id: 'tr-9001',
        employeeId: 'emp-001',
        status: 'IN_REVIEW',
        currentStage: 'CURRENT_MANAGER_REVIEW',
        currentManagerId: 'mgr-101',
        hiringManagerId: 'hm-201',
        hrAdminId: 'hr-301',
      },
    ],
  ]);

  private stages: Map<string, WorkflowStageEntity[]> = new Map([
    [
      'tr-9001',
      [
        {
          id: 'stg-1',
          stageName: 'CURRENT_MANAGER_REVIEW',
          stageOrder: 1,
          assignedReviewer: {
            id: 'mgr-101',
            name: 'Jane Doe',
            role: 'CURRENT_MANAGER',
            email: 'jane.doe@intglobal.com',
          },
          enteredAt: new Date().toISOString(),
          status: 'IN_PROGRESS',
        },
        {
          id: 'stg-2',
          stageName: 'HIRING_MANAGER_REVIEW',
          stageOrder: 2,
          assignedReviewer: {
            id: 'hm-201',
            name: 'Bob Smith',
            role: 'HIRING_MANAGER',
            email: 'bob.smith@intglobal.com',
          },
          enteredAt: '',
          status: 'PENDING',
        },
        {
          id: 'stg-3',
          stageName: 'HR_VALIDATION',
          stageOrder: 3,
          assignedReviewer: {
            id: 'hr-301',
            name: 'Sarah Connor',
            role: 'HR_ADMIN',
            email: 'sarah.connor@intglobal.com',
          },
          enteredAt: '',
          status: 'PENDING',
        },
      ],
    ],
  ]);

  private history: Map<string, WorkflowHistoryItem[]> = new Map([
    [
      'tr-9001',
      [
        {
          stage: 'INITIATION',
          actor: 'emp-001',
          action: 'SUBMIT',
          timestamp: new Date().toISOString(),
          remarks: 'Transfer initiated',
        },
      ],
    ],
  ]);

  async findTransferById(transferId: string): Promise<TransferSummary | null> {
    return this.transfers.get(transferId) || null;
  }

  async getWorkflowState(transferId: string): Promise<WorkflowStateResponse | null> {
    const transfer = this.transfers.get(transferId);
    if (!transfer) return null;

    const stagesList = this.stages.get(transferId) || [];
    const currentStage = stagesList.find((s) => s.stageName === transfer.currentStage) || null;
    const completedStages = stagesList.filter((s) => s.status === 'COMPLETED');
    const historyList = this.history.get(transferId) || [];

    return {
      transferId,
      status: transfer.status,
      currentStage,
      completedStages,
      history: historyList,
    };
  }

  async findCurrentStage(transferId: string): Promise<WorkflowStageEntity | null> {
    const transfer = this.transfers.get(transferId);
    if (!transfer) return null;
    const stagesList = this.stages.get(transferId) || [];
    return stagesList.find((s) => s.stageName === transfer.currentStage) || null;
  }

  async recordDecisionAndAdvance(params: RecordDecisionParams): Promise<any> {
    const transfer = this.transfers.get(params.transferId);
    if (!transfer) throw new Error(`Transfer ${params.transferId} not found`);

    const previousStage = transfer.currentStage;
    const now = new Date().toISOString();

    // Update transfer state
    if (params.nextStage) {
      transfer.currentStage = params.nextStage as any;
    }
    transfer.status = params.nextStatus as any;

    // Append to history
    const historyList = this.history.get(params.transferId) || [];
    historyList.push({
      stage: previousStage,
      actor: params.actorId,
      action: params.action,
      timestamp: now,
      remarks: params.remarks,
    });
    this.history.set(params.transferId, historyList);

    // Update stage entities
    const stagesList = this.stages.get(params.transferId) || [];
    const curr = stagesList.find((s) => s.stageName === previousStage);
    if (curr) {
      curr.completedAt = now;
      curr.status = 'COMPLETED';
    }
    if (params.nextStage) {
      const next = stagesList.find((s) => s.stageName === params.nextStage);
      if (next) {
        next.enteredAt = now;
        next.status = 'IN_PROGRESS';
      }
    }

    return {
      transferId: params.transferId,
      previousStage,
      currentStage: transfer.currentStage,
      status: transfer.status,
      decision: {
        actorId: params.actorId,
        action: params.action,
        remarks: params.remarks,
        timestamp: now,
      },
    };
  }

  async executeTransaction<T>(work: () => Promise<T>): Promise<T> {
    // In-memory atomic execution wrapper
    return await work();
  }
}
