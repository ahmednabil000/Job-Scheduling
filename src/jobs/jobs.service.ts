import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { db } from '../database/index';
import { jobs } from 'src/database/job.schema';
import { eq } from 'drizzle-orm';
import { createJobValidator } from './validators/create-job.validator';
import { JobValidatorFactory } from './factories/job-validator.factory';

@Injectable()
export class JobsService {
  constructor(private readonly jobValidatorFactory: JobValidatorFactory) {}

  public async findAll() {
    return await db.select().from(jobs);
  }

  async findOne(id: string) {
    const jbs = await db.select().from(jobs).where(eq(jobs.id, id));
    if (jbs.length === 0) {
      return null;
    }
    return jbs[0];
  }
  async create(createJobDto: CreateJobDto) {
    const data = createJobValidator.parse(createJobDto);

    const validator = this.jobValidatorFactory.getValidator(data.name);

    if (!validator) {
      throw new BadRequestException(`Unknown job name: ${data.name}`);
    }

    const result = validator.safeParse(data.data);
    if (!result.success) {
      throw new BadRequestException(
        `Invalid ${data.name} job data: ${result.error.issues[0].message}`,
      );
    }

    const [job] = await db
      .insert(jobs)
      .values({
        name: data.name,
        interval: data.interval,
        data: data.data,
        lastRunAt: new Date(),
        nextRunAt: new Date(Date.now() + data.interval * 1000),
        status: 'PENDING',
        createdAt: new Date(),
      })
      .returning();
    return { jobId: job.id };
  }
}
