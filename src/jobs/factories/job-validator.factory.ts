import { Injectable } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { emailSenderJobValidator } from '../validators/email-sender.validator';
import { smsSenderJobValidator } from '../validators/sms-sender.validator';

@Injectable()
export class JobValidatorFactory {
  public getValidator(type: string): ZodSchema | null {
    switch (type.toLowerCase()) {
      case 'email':
        return emailSenderJobValidator;
      case 'sms':
        return smsSenderJobValidator;
      default:
        return null; // Or throw error, but service handles "unknown" usually
    }
  }
}
