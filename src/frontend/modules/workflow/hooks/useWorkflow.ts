/**
 * Custom React Hook for Workflow Execution & Decision Processing
 * Spec: .ai-context/specs/workflow-orchestration.spec.md
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  workflowApi, 
  WorkflowState, 
  SubmitDecisionPayload, 
  DecisionResult 
} from '../services/workflow.api';

export function useWorkflow(transferId: string, currentUserId?: string) {
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDecisionResult, setLastDecisionResult] = useState<DecisionResult | null>(null);

  const loadWorkflow = useCallback(async () => {
    if (!transferId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await workflowApi.fetchWorkflowState(transferId);
      setWorkflowState(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workflow state');
    } finally {
      setIsLoading(false);
    }
  }, [transferId]);

  useEffect(() => {
    loadWorkflow();
  }, [loadWorkflow]);

  const submitDecision = async (payload: SubmitDecisionPayload): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await workflowApi.submitDecision(transferId, payload);
      setLastDecisionResult(result);
      await loadWorkflow();
      return true;
    } catch (err: any) {
      setError(err.message || 'Decision submission failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if current user is the assigned reviewer for the active stage
  const canAct = Boolean(
    currentUserId &&
    workflowState?.currentStage?.assignedReviewer?.id === currentUserId &&
    workflowState?.status === 'IN_REVIEW'
  );

  return {
    workflowState,
    isLoading,
    isSubmitting,
    error,
    lastDecisionResult,
    canAct,
    reload: loadWorkflow,
    submitDecision,
  };
}
