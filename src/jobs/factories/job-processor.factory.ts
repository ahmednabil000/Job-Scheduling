import { Injectable } from '@nestjs/common';
import { Job } from 'src/database/job.schema';
import { JobProcessor } from '../interfaces/job-processor.interface';
import { EmailSenderJobProcessor } from '../processors/email-sender.processor';
import { SmsSenderJobProcessor } from '../processors/sms-sender.processor';
import { InvalidJobProcessor } from '../processors/invalid-job.processor';
import { emailSenderJobValidator } from '../validators/email-sender.validator';
import { smsSenderJobValidator } from '../validators/sms-sender.validator';

@Injectable()
export class JobProcessorFactory {
  constructor() {}
  public createProcess(job: Job): JobProcessor {
    switch (job.name.toLowerCase()) {
      case 'email-sender': {
        const data = emailSenderJobValidator.parse(job.data);
        if (data) {
          return new EmailSenderJobProcessor(data);
        }
        return new InvalidJobProcessor({ jobId: job.id });
      }
      case 'sms-sender': {
        const data = smsSenderJobValidator.parse(job.data);
        if (data) {
          return new SmsSenderJobProcessor(data);
        }
        return new InvalidJobProcessor({ jobId: job.id });
      }
      default:
        return new InvalidJobProcessor({ jobId: job.id });
    }
  }
}
