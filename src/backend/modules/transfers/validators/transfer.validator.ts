import { z } from 'zod';
import { ValidationError } from '../../../shared/errors';

export const createTransferSchema = z.object({
  proposedDepartmentId: z.string({
    required_error: 'proposedDepartmentId is required',
  }).min(1, 'proposedDepartmentId cannot be empty'),
  
  proposedLocationId: z.string({
    required_error: 'proposedLocationId is required',
  }).min(1, 'proposedLocationId cannot be empty'),
  
  proposedRoleId: z.string({
    required_error: 'proposedRoleId is required',
  }).min(1, 'proposedRoleId cannot be empty'),
  
  effectiveDate: z.string({
    required_error: 'effectiveDate is required',
  }).refine((dateStr) => {
    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime()) && parsed > new Date();
  }, {
    message: 'effectiveDate must be a valid ISO date in the future',
  }),
  
  transferReason: z.string().max(1000, 'transferReason must not exceed 1000 characters').optional(),
  
  supportingDocumentUrls: z.array(z.string().url('Invalid supporting document URL')).optional(),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>;

export function validateCreateTransfer(input: unknown): CreateTransferInput {
  const result = createTransferSchema.safeParse(input);
  if (!result.success) {
    const errorDetails = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    throw new ValidationError('Validation failed for transfer submission', errorDetails);
  }
  return result.data;
}
