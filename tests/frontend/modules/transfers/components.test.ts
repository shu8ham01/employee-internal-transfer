/**
 * Frontend Component & Hook Type Checks and Verification
 */

import { EligibilityData, LookupData } from '../../../../src/frontend/modules/transfers/services/transfer.api';

describe('Frontend Transfers Module Structure', () => {
  it('should validate EligibilityData structure', () => {
    const mockEligibility: EligibilityData = {
      isEligible: true,
      hasActiveTransfer: false,
      activeTransferId: null,
      currentDepartment: { id: 'dept-101', name: 'Frontend Engineering' },
      currentRole: { id: 'role-201', title: 'Software Engineer' },
      currentLocation: { id: 'loc-301', name: 'Kolkata HQ' },
      tenureMonths: 18,
    };

    expect(mockEligibility.isEligible).toBe(true);
    expect(mockEligibility.hasActiveTransfer).toBe(false);
  });

  it('should validate LookupData schema', () => {
    const mockLookup: LookupData = {
      departments: [{ id: 'dept-102', name: 'Cloud Infrastructure' }],
      locations: [{ id: 'loc-302', name: 'Bengaluru Office' }],
      roles: [{ id: 'role-202', title: 'DevOps Engineer', departmentId: 'dept-102' }],
    };

    expect(mockLookup.departments.length).toBe(1);
    expect(mockLookup.locations[0].name).toBe('Bengaluru Office');
    expect(mockLookup.roles[0].departmentId).toBe('dept-102');
  });
});
