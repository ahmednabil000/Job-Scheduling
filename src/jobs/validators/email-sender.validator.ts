import * as zod from 'zod';
import { z } from 'zod';

export const emailSenderJobValidator = zod.object({
  to: zod.email(),
  from: zod.email(),
});

export type EmailSernderData = z.infer<typeof emailSenderJobValidator>;
