import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { SchedulerService } from './scheduler.service';
import { JobProcessorFactory } from './factories/job-processor.factory';
import { JobValidatorFactory } from './factories/job-validator.factory';
import { JobTypeRegistry } from './job-type.registry';

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    SchedulerService,
    JobProcessorFactory,
    JobValidatorFactory,
    JobTypeRegistry,
  ],
})
export class JobsModule {}
