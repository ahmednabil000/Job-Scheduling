import { JobProcessor } from '../interfaces/job-processor.interface';
import { Logger } from '@nestjs/common';

export class InvalidJobProcessor implements JobProcessor {
  private readonly logger = new Logger(InvalidJobProcessor.name);
  private _data: { jobId: string };
  constructor(data: { jobId: string }) {
    this._data = data;
  }
  public async process(): Promise<void> {
    this.logger.log(`Invalid job processor id: ${this._data.jobId}`);
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}
