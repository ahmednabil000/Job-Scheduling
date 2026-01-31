import * as z from 'zod';

export const emailSenderJobValidator = z.object({
  to: z.email(),
  from: z.email(),
});
