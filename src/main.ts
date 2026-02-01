import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { JobTypeRegistry } from './jobs/job-type.registry';
import { EmailSenderJobProcessor } from './jobs/processors/email-sender.processor';
import { SmsSenderJobProcessor } from './jobs/processors/sms-sender.processor';
import {
  EmailSernderData,
  emailSenderJobValidator,
} from './jobs/validators/email-sender.validator';
import {
  SmsSenderData,
  smsSenderJobValidator,
} from './jobs/validators/sms-sender.validator';
import { NotificationSenderJobProcessor } from './jobs/processors/notification-sender.processor';
import {
  notificationSenderJobValidator,
  NotificationSernderData,
} from './jobs/validators/notification-sender.validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // Register job types
  const jobTypeRegistry = app.get(JobTypeRegistry);
  jobTypeRegistry.register({
    type: 'email-sender',
    validator: emailSenderJobValidator,
    processorCreator: (data) =>
      new EmailSenderJobProcessor(data as EmailSernderData),
  });
  jobTypeRegistry.register({
    type: 'sms-sender',
    validator: smsSenderJobValidator,
    processorCreator: (data) =>
      new SmsSenderJobProcessor(data as SmsSenderData),
  });
  jobTypeRegistry.register({
    type: 'notification-sender',
    validator: notificationSenderJobValidator,
    processorCreator: (data) =>
      new NotificationSenderJobProcessor(data as NotificationSernderData),
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
