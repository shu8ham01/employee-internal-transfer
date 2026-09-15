/**
 * Transfer Repository Implementation & Interfaces
 */

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  currentDepartmentId: string;
  currentDepartmentName: string;
  currentRoleId: string;
  currentRoleTitle: string;
  currentLocationId: string;
  currentLocationName: string;
  tenureMonths: number;
}

export interface TransferRecord {
  id: string;
  employeeId: string;
  proposedDepartmentId: string;
  proposedLocationId: string;
  proposedRoleId: string;
  effectiveDate: string;
  transferReason?: string;
  supportingDocumentUrls?: string[];
  status: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  currentStage: 'CURRENT_MANAGER_REVIEW' | 'HIRING_MANAGER_REVIEW' | 'HR_VALIDATION' | 'FULFILLMENT' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

export interface ITransferRepository {
  findEmployeeById(employeeId: string): Promise<EmployeeProfile | null>;
  findActiveTransferByEmployeeId(employeeId: string): Promise<TransferRecord | null>;
  getLookupData(): Promise<{
    departments: Array<{ id: string; name: string }>;
    locations: Array<{ id: string; name: string }>;
    roles: Array<{ id: string; title: string; departmentId: string }>;
  }>;
  createTransferRequest(data: Omit<TransferRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransferRecord>;
}

export class InMemoryTransferRepository implements ITransferRepository {
  private employees: Map<string, EmployeeProfile> = new Map([
    [
      'emp-001',
      {
        id: 'emp-001',
        name: 'Alex Chen',
        email: 'alex.chen@intglobal.com',
        currentDepartmentId: 'dept-101',
        currentDepartmentName: 'Frontend Engineering',
        currentRoleId: 'role-201',
        currentRoleTitle: 'Software Engineer',
        currentLocationId: 'loc-301',
        currentLocationName: 'Kolkata HQ',
        tenureMonths: 18,
      },
    ],
  ]);

  private transfers: Map<string, TransferRecord> = new Map();

  private departments = [
    { id: 'dept-101', name: 'Frontend Engineering' },
    { id: 'dept-102', name: 'Cloud Infrastructure' },
    { id: 'dept-103', name: 'AI & Analytics' },
  ];

  private locations = [
    { id: 'loc-301', name: 'Kolkata HQ' },
    { id: 'loc-302', name: 'Bengaluru Office' },
  ];

  private roles = [
    { id: 'role-201', title: 'Software Engineer', departmentId: 'dept-101' },
    { id: 'role-202', title: 'DevOps Engineer', departmentId: 'dept-102' },
    { id: 'role-203', title: 'AI Engineer', departmentId: 'dept-103' },
  ];

  async findEmployeeById(employeeId: string): Promise<EmployeeProfile | null> {
    return this.employees.get(employeeId) || null;
  }

  async findActiveTransferByEmployeeId(employeeId: string): Promise<TransferRecord | null> {
    for (const record of this.transfers.values()) {
      if (
        record.employeeId === employeeId &&
        (record.status === 'SUBMITTED' || record.status === 'IN_REVIEW')
      ) {
        return record;
      }
    }
    return null;
  }

  async getLookupData(): Promise<{
    departments: Array<{ id: string; name: string }>;
    locations: Array<{ id: string; name: string }>;
    roles: Array<{ id: string; title: string; departmentId: string }>;
  }> {
    return {
      departments: [...this.departments],
      locations: [...this.locations],
      roles: [...this.roles],
    };
  }

  async createTransferRequest(
    data: Omit<TransferRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TransferRecord> {
    const id = `tr-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const record: TransferRecord = {
      id,
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.transfers.set(id, record);
    return record;
  }
}
