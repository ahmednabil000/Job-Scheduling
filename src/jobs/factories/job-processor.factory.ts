import { Injectable } from '@nestjs/common';
import { Job } from 'src/database/job.schema';
import { JobProcessor } from '../interfaces/job-processor.interface';
import { InvalidJobProcessor } from '../processors/invalid-job.processor';
import { JobValidatorFactory } from './job-validator.factory';

export type JobProcessorCreator = (data: unknown) => JobProcessor;

@Injectable()
export class JobProcessorFactory {
  private processorsMap = new Map<string, JobProcessorCreator>();

  constructor(private readonly validatorFactory: JobValidatorFactory) {}

  public registerProcessor(type: string, creator: JobProcessorCreator): void {
    this.processorsMap.set(type.toLowerCase(), creator);
  }

  public createProcess(job: Job): JobProcessor {
    const type = job.type.toLowerCase();

    if (!this.processorsMap.has(type)) {
      return new InvalidJobProcessor({ jobId: job.id });
    }

    const validator = this.validatorFactory.getValidator(type);
    if (!validator) {
      return new InvalidJobProcessor({ jobId: job.id });
    }

    const validatedData = validator.parse(job.data);
    const processorCreator = this.processorsMap.get(type)!;
    return processorCreator(validatedData);
  }
}
