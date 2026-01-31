import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { jobs, Job } from 'src/database/job.schema';
import { db } from '../database/index';
import { eq, sql, inArray } from 'drizzle-orm';
import { JobProcessor } from './interfaces/job-processor.interface';
import { JobProcessorFactory } from './factories/job-processor.factory';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly BATCH_SIZE = Number(process.env.BATCH_SIZE) || 10;
  private readonly POLL_INTERVAL = Number(process.env.POLL_INTERVAL) || 5000;
  private readonly processorsMap = new Map<string, JobProcessor>();
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly jobProcessorFactory: JobProcessorFactory) {}

  async onModuleInit() {
    this.logger.log(
      `Scheduler initialized (Poll: ${this.POLL_INTERVAL}ms, Batch: ${this.BATCH_SIZE})`,
    );

    await this.recoverStuckJobs();

    void this.handleSchedualing();
    setInterval(() => {
      void this.handleSchedualing();
    }, this.POLL_INTERVAL);
  }

  private async handleSchedualing() {
    this.logger.log('Running Schedualed Jobs...');
    try {
      await db.transaction(async (tx) => {
        const result = await tx.execute(sql`
          SELECT * FROM ${jobs}
          WHERE ${jobs.nextRunAt} <= NOW() 
          AND ${jobs.status} != 'RUNNING'
          ORDER BY ${jobs.nextRunAt} ASC
          LIMIT ${this.BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        `);
        this.logger.log(`Found ${result.rowCount} jobs`);
        for (const job of result.rows) {
          await tx
            .update(jobs)
            .set({ status: 'RUNNING' })
            .where(eq(jobs.id, job.id as string));

          void this.executeJob(job as Job);
        }
      });
    } catch (error) {
      this.logger.error('Job scheduler error:', error);
    }
  }

  private async executeJob(job: Job) {
    this.logger.log(`Processing job: ${job.name} (ID: ${job.id})`);

    try {
      if (this.processorsMap.has(job.name)) {
        const processor = this.processorsMap.get(job.name)!;
        await processor.process();
      } else {
        const processor = this.jobProcessorFactory.createProcess(job);
        await processor.process();
      }

      const interval = job.interval * 1000;
      const nextRun = new Date(Date.now() + interval);

      await db
        .update(jobs)
        .set({
          status: 'PENDING',
          nextRunAt: nextRun,
          lastRunAt: new Date(),
        })
        .where(eq(jobs.id, job.id));
    } catch (error) {
      this.logger.error(`Error executing job ${job.id}:`, error);
      await db
        .update(jobs)
        .set({ status: 'FAILED' })
        .where(eq(jobs.id, job.id));
    }
  }
  private async recoverStuckJobs() {
    try {
      this.logger.log('Recovering stuck jobs...');
      const result = await db
        .update(jobs)
        .set({ status: 'PENDING' })
        .where(inArray(jobs.status, ['RUNNING', 'FAILED']))
        .returning();
      this.logger.log(
        `Recovered ${result.length} jobs from RUNNING/FAILED state.`,
      );
    } catch (error) {
      this.logger.error('Failed to recover stuck jobs:', error);
    }
  }
}
