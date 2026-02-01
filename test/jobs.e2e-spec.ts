import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { db } from './../src/database/index';
import { jobs } from './../src/database/job.schema';
import { eq, inArray } from 'drizzle-orm';
import { JobTypeRegistry } from './../src/jobs/job-type.registry';
import { EmailSenderJobProcessor } from './../src/jobs/processors/email-sender.processor';
import { SmsSenderJobProcessor } from './../src/jobs/processors/sms-sender.processor';
import { NotificationSenderJobProcessor } from './../src/jobs/processors/notification-sender.processor';
import {
  EmailSernderData,
  emailSenderJobValidator,
} from './../src/jobs/validators/email-sender.validator';
import {
  SmsSenderData,
  smsSenderJobValidator,
} from './../src/jobs/validators/sms-sender.validator';
import {
  NotificationSernderData,
  notificationSenderJobValidator,
} from './../src/jobs/validators/notification-sender.validator';

describe('JobsController (e2e)', () => {
  let app: INestApplication;
  let createdJobsId;
  beforeAll(async () => {
    process.env.POLL_INTERVAL = '1000';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    createdJobsId = [];
    app = moduleFixture.createNestApplication();
    await app.init();

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
  }, 30000);

  afterAll(async () => {
    console.log(createdJobsId);
    await db.delete(jobs).where(inArray(jobs.id, createdJobsId));
    await app.close();
  });

  beforeEach(async () => {});

  it('/jobs (POST) - Create SMS Job and Verify Execution', async () => {
    const smsJobData = {
      name: 'personal sms',
      type: 'sms-sender',
      interval: 0,
      data: {
        to: '+1234567890',
        message: 'Hello E2E',
      },
    };

    const createResponse = await request(app.getHttpServer())
      .post('/jobs')
      .send(smsJobData)
      .expect(201);

    expect(createResponse.body).toHaveProperty('jobId');
    const jobId = createResponse.body.jobId;

    createdJobsId.push(jobId);

    const [initialJob] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId as string));

    expect(initialJob).toBeDefined();
    expect(initialJob?.status).toBe('PENDING');
    expect(initialJob.name).toBe('personal sms');
    expect(initialJob?.type).toBe('sms-sender');
    expect(initialJob?.data).toEqual(smsJobData.data);

    const initialLastRunAt = initialJob!.lastRunAt.getTime();

    let jobExecuted = false;

    const startTime = Date.now();

    while (Date.now() - startTime < 10000) {
      const [currentJob] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId as string));

      if (currentJob && currentJob.lastRunAt.getTime() > initialLastRunAt) {
        jobExecuted = true;
        break;
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    expect(jobExecuted).toBe(true);
  }, 60000);

  it('/jobs (GET) - Fetch All Jobs', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        name: 'personal sms',
        type: 'sms-sender',
        interval: 10,
        data: { to: '+123', message: 'test' },
      })
      .expect(201);
    createdJobsId.push(createResponse.body.jobId);
    const response = await request(app.getHttpServer())
      .get('/jobs')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('type');
  });

  it('/jobs/:id (GET) - Fetch Job by ID', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        name: 'personal sms',
        type: 'sms-sender',
        interval: 10,
        data: { to: '+123', message: 'test' },
      })
      .expect(201);

    const jobId = createResponse.body.jobId;
    createdJobsId.push(jobId);
    const response = await request(app.getHttpServer())
      .get(`/jobs/${jobId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', jobId);
    expect(response.body).toHaveProperty('type', 'sms-sender');
  });
});
