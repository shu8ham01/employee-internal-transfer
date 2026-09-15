import { z } from 'zod';
import { ValidationError } from '../../../shared/errors';

export const decisionActionSchema = z.enum(['APPROVE', 'REJECT', 'REQUEST_REVISION'], {
  errorMap: () => ({ message: 'action must be one of APPROVE, REJECT, or REQUEST_REVISION' }),
});

export type DecisionAction = z.infer<typeof decisionActionSchema>;

export const workflowDecisionSchema = z.object({
  action: decisionActionSchema,
  remarks: z.string({
    required_error: 'remarks are mandatory for decisions',
  }).trim().min(1, 'remarks cannot be empty').max(2000, 'remarks cannot exceed 2000 characters'),
  targetReleaseDate: z.string().optional().refine((dateStr) => {
    if (!dateStr) return true;
    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime());
  }, {
    message: 'targetReleaseDate must be a valid ISO date string if provided',
  }),
});

export type WorkflowDecisionInput = z.infer<typeof workflowDecisionSchema>;

export function validateWorkflowDecision(input: unknown): WorkflowDecisionInput {
  const result = workflowDecisionSchema.safeParse(input);
  if (!result.success) {
    const errorDetails = result.error.errors.map(
      (err) => `${err.path.join('.')}: ${err.message}`
    );
    throw new ValidationError('Validation failed for workflow decision', errorDetails);
  }
  return result.data;
}
