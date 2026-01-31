import { JobProcessor } from '../interfaces/job-processor.interface';
import { Logger } from '@nestjs/common';
import { EmailSernderData } from '../validators/email-sender.validator';

export class EmailSenderJobProcessor implements JobProcessor {
  private readonly logger = new Logger(EmailSenderJobProcessor.name);
  private _data: EmailSernderData;
  constructor(data: EmailSernderData) {
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
