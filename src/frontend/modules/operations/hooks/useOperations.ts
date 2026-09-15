/**
 * Custom React Hook for Operational Fulfillment
 * Spec: .ai-context/specs/operational-orchestration.spec.md
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  operationsApi, 
  OperationalTask, 
  UpdateTaskPayload, 
  CompleteTransferResponse 
} from '../services/operations.api';

export function useOperations(transferId: string) {
  const [tasks, setTasks] = useState<OperationalTask[]>([]);
  const [isAllCompleted, setIsAllCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [closureResult, setClosureResult] = useState<CompleteTransferResponse | null>(null);

  const loadTasks = useCallback(async () => {
    if (!transferId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await operationsApi.fetchTasks(transferId);
      setTasks(data.tasks || []);
      setIsAllCompleted(data.isAllCompleted);
    } catch (err: any) {
      setError(err.message || 'Failed to load fulfillment tasks');
    } finally {
      setIsLoading(false);
    }
  }, [transferId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateTask = async (taskId: string, payload: UpdateTaskPayload): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);
    try {
      await operationsApi.updateTask(transferId, taskId, payload);
      await loadTasks();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update task status');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const finalizeTransfer = async (userRole: string = 'HR_ADMIN'): Promise<boolean> => {
    setIsClosing(true);
    setError(null);
    try {
      const result = await operationsApi.completeTransfer(transferId, userRole);
      setClosureResult(result);
      await loadTasks();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to finalize transfer');
      return false;
    } finally {
      setIsClosing(false);
    }
  };

  return {
    tasks,
    isAllCompleted,
    isLoading,
    isUpdating,
    isClosing,
    error,
    closureResult,
    updateTask,
    finalizeTransfer,
    reload: loadTasks,
  };
}
