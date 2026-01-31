import { z } from 'zod';

export const createJobValidator = z.object({
  name: z.string().min(3).max(100),
  interval: z.number().nonnegative(),
  data: z.record(z.string(), z.any()),
});

export type CreateJobInput = z.infer<typeof createJobValidator>;
