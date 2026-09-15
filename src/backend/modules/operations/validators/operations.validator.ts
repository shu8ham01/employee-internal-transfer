import { z } from 'zod';
import { ValidationError } from '../../../shared/errors';

export const updateTaskStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'], {
    errorMap: () => ({ message: 'status must be PENDING, IN_PROGRESS, or COMPLETED' }),
  }),
  notes: z.string().max(1000, 'notes cannot exceed 1000 characters').optional(),
  completedBy: z.string().email('completedBy must be a valid email').optional(),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export function validateUpdateTaskStatus(input: unknown): UpdateTaskStatusInput {
  const result = updateTaskStatusSchema.safeParse(input);
  if (!result.success) {
    const errorDetails = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    throw new ValidationError('Validation failed for operational task update', errorDetails);
  }
  return result.data;
}
