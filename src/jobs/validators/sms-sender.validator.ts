import * as z from 'zod';

export const smsSenderJobValidator = z.object({
  to: z.string().min(1),
  message: z.string().min(1),
});

export type SmsSenderData = z.infer<typeof smsSenderJobValidator>;
