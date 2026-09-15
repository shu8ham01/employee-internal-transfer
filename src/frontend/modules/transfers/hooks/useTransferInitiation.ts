/**
 * Custom React Hook for Transfer Initiation Workflow
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  transferApi, 
  EligibilityData, 
  LookupData, 
  CreateTransferPayload, 
  TransferSubmissionResult 
} from '../services/transfer.api';

export function useTransferInitiation() {
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [lookupData, setLookupData] = useState<LookupData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedTransfer, setSubmittedTransfer] = useState<TransferSubmissionResult | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [eligibilityRes, lookupRes] = await Promise.all([
        transferApi.fetchEligibility(),
        transferApi.fetchLookupData(),
      ]);
      setEligibility(eligibilityRes);
      setLookupData(lookupRes);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize transfer portal');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const submitTransfer = async (payload: CreateTransferPayload): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await transferApi.submitTransfer(payload);
      setSubmittedTransfer(result);
      return true;
    } catch (err: any) {
      setError(err.message || 'Submission failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    eligibility,
    lookupData,
    isLoading,
    isSubmitting,
    error,
    submittedTransfer,
    reload: loadInitialData,
    submitTransfer,
  };
}
