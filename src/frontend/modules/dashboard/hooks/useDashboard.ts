/**
 * Custom React Hook for Transparency Dashboard
 * Spec: .ai-context/specs/transparency-dashboard.spec.md
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  dashboardApi, 
  DashboardTransfer, 
  TimelineResponse, 
  PendingApproval 
} from '../services/dashboard.api';

export function useDashboard(userId?: string, isManager: boolean = false) {
  const [transfers, setTransfers] = useState<DashboardTransfer[]>([]);
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTimelineLoading, setIsTimelineLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const promises: [Promise<any>, Promise<any>?] = [dashboardApi.fetchTransfers(userId)];
      if (isManager) {
        promises.push(dashboardApi.fetchPendingApprovals(userId));
      }

      const [transfersRes, approvalsRes] = await Promise.all(promises);
      setTransfers(transfersRes.transfers || []);

      if (approvalsRes) {
        setPendingApprovals(approvalsRes.pendingApprovals || []);
      }

      // Automatically select first active transfer if available
      if (transfersRes.transfers?.length > 0) {
        const firstId = transfersRes.transfers[0].id;
        setSelectedTransferId(firstId);
        const timelineRes = await dashboardApi.fetchTimeline(firstId);
        setTimeline(timelineRes);
      } else {
        setSelectedTransferId(null);
        setTimeline(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isManager]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const selectTransfer = async (transferId: string) => {
    setSelectedTransferId(transferId);
    setIsTimelineLoading(true);
    try {
      const data = await dashboardApi.fetchTimeline(transferId);
      setTimeline(data);
    } catch (err: any) {
      setError(err.message || `Failed to fetch timeline for ${transferId}`);
    } finally {
      setIsTimelineLoading(false);
    }
  };

  return {
    transfers,
    selectedTransferId,
    timeline,
    pendingApprovals,
    isLoading,
    isTimelineLoading,
    error,
    selectTransfer,
    reload: loadDashboard,
  };
}
