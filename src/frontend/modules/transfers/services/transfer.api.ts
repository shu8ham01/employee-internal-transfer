/**
 * Transfer Frontend API Client
 */

export interface EligibilityData {
  isEligible: boolean;
  hasActiveTransfer: boolean;
  activeTransferId: string | null;
  currentDepartment: { id: string; name: string };
  currentRole: { id: string; title: string };
  currentLocation: { id: string; name: string };
  tenureMonths: number;
}

export interface LookupData {
  departments: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; title: string; departmentId: string }>;
}

export interface CreateTransferPayload {
  proposedDepartmentId: string;
  proposedLocationId: string;
  proposedRoleId: string;
  effectiveDate: string;
  transferReason?: string;
  supportingDocumentUrls?: string[];
}

export interface TransferSubmissionResult {
  id: string;
  employeeId: string;
  proposedDepartmentId: string;
  proposedLocationId: string;
  proposedRoleId: string;
  effectiveDate: string;
  status: string;
  currentStage: string;
}

const BASE_URL = '/api/v1/transfers';

export const transferApi = {
  async fetchEligibility(): Promise<EligibilityData> {
    const res = await fetch(`${BASE_URL}/eligibility`);
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new Error(err.message || 'Failed to fetch eligibility status');
    }
    return res.json() as Promise<EligibilityData>;
  },

  async fetchLookupData(): Promise<LookupData> {
    const res = await fetch(`${BASE_URL}/lookup-data`);
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new Error(err.message || 'Failed to fetch lookup data');
    }
    return res.json() as Promise<LookupData>;
  },

  async submitTransfer(payload: CreateTransferPayload): Promise<TransferSubmissionResult> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      const message = data.message || (data.details ? data.details.join(', ') : 'Failed to submit transfer request');
      const error = new Error(message) as any;
      error.status = res.status;
      error.details = data.details;
      throw error;
    }

    return data as TransferSubmissionResult;
  },
};
