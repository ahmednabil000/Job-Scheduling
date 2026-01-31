import { JobProcessor } from '../interfaces/job-processor.interface';
import { Logger } from '@nestjs/common';

export class SmsSenderJobProcessor implements JobProcessor {
  private readonly logger = new Logger(SmsSenderJobProcessor.name);
  private _data: { to: string; message: string };
  constructor(data: { to: string; message: string }) {
    this._data = data;
  }
  public async process(): Promise<void> {
    this.logger.log(`Sending SMS to ${this._data.to}: ${this._data.message}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    this.logger.log(`Finish sending SMS to ${this._data.to}`);
  }
}
