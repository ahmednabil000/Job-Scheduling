import { JobProcessor } from '../interfaces/job-processor.interface';
import { Logger } from '@nestjs/common';

export class EmailSenderJobProcessor implements JobProcessor {
  private readonly logger = new Logger(EmailSenderJobProcessor.name);
  private _data: { to: string; from: string };
  constructor(data: { to: string; from: string }) {
    this._data = data;
  }
  public async process(): Promise<void> {
    this.logger.log(
      `Sending email to ${this._data.to} from ${this._data.from}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 30000));
    this.logger.log(
      `Finish sening email to ${this._data.to} from ${this._data.from}`,
    );
  }
}
