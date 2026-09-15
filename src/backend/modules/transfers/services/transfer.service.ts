/**
 * Transfer Service Implementation (TDD GREEN Phase)
 */

import { ITransferRepository, TransferRecord } from '../repositories/transfer.repository';
import { validateCreateTransfer } from '../validators/transfer.validator';
import { 
  ConflictError, 
  UnprocessableEntityError, 
  NotFoundError 
} from '../../../shared/errors';

export interface EligibilityResponse {
  isEligible: boolean;
  hasActiveTransfer: boolean;
  activeTransferId: string | null;
  currentDepartment: { id: string; name: string };
  currentRole: { id: string; title: string };
  currentLocation: { id: string; name: string };
  tenureMonths: number;
}

export interface CreateTransferDTO {
  proposedDepartmentId: string;
  proposedLocationId: string;
  proposedRoleId: string;
  effectiveDate: string;
  transferReason?: string;
  supportingDocumentUrls?: string[];
}

export class TransferService {
  constructor(private readonly transferRepository: ITransferRepository) {}

  async checkEligibility(employeeId: string): Promise<EligibilityResponse> {
    const employee = await this.transferRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundError(`Employee profile with ID ${employeeId} not found`);
    }

    const activeTransfer = await this.transferRepository.findActiveTransferByEmployeeId(employeeId);
    const hasActiveTransfer = activeTransfer !== null;

    return {
      isEligible: !hasActiveTransfer,
      hasActiveTransfer,
      activeTransferId: activeTransfer ? activeTransfer.id : null,
      currentDepartment: {
        id: employee.currentDepartmentId,
        name: employee.currentDepartmentName,
      },
      currentRole: {
        id: employee.currentRoleId,
        title: employee.currentRoleTitle,
      },
      currentLocation: {
        id: employee.currentLocationId,
        name: employee.currentLocationName,
      },
      tenureMonths: employee.tenureMonths,
    };
  }

  async getLookupData() {
    return this.transferRepository.getLookupData();
  }

  async submitTransferRequest(employeeId: string, dto: CreateTransferDTO): Promise<TransferRecord> {
    // 1. Schema and constraint validation
    const validatedData = validateCreateTransfer(dto);

    // 2. Fetch employee
    const employee = await this.transferRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw new NotFoundError(`Employee with ID ${employeeId} does not exist`);
    }

    // 3. Reject if active transfer exists (AC3)
    const existingActiveTransfer = await this.transferRepository.findActiveTransferByEmployeeId(employeeId);
    if (existingActiveTransfer) {
      throw new ConflictError('An active transfer request is already in progress for this employee');
    }

    // 4. Reject if target department and role are identical to current assignment (AC4)
    if (
      validatedData.proposedDepartmentId === employee.currentDepartmentId &&
      validatedData.proposedRoleId === employee.currentRoleId
    ) {
      throw new UnprocessableEntityError(
        'Proposed department and role cannot match current active department and role'
      );
    }

    // 5. Persist transfer request with initial SUBMITTED state & CURRENT_MANAGER_REVIEW stage (AC2)
    return this.transferRepository.createTransferRequest({
      employeeId,
      proposedDepartmentId: validatedData.proposedDepartmentId,
      proposedLocationId: validatedData.proposedLocationId,
      proposedRoleId: validatedData.proposedRoleId,
      effectiveDate: validatedData.effectiveDate,
      transferReason: validatedData.transferReason,
      supportingDocumentUrls: validatedData.supportingDocumentUrls,
      status: 'SUBMITTED',
      currentStage: 'CURRENT_MANAGER_REVIEW',
    });
  }
}
