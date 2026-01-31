import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { db } from './../src/database/index';
import { jobs } from './../src/database/job.schema';
import { eq } from 'drizzle-orm';

describe('JobsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await db.delete(jobs);
    await app.close();
  });

  beforeEach(async () => {
    await db.delete(jobs);
  });

  it('/jobs (POST) - Create SMS Job and Verify Execution', async () => {
    const smsJobData = {
      name: 'sms',
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

    const [initialJob] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId as string));

    expect(initialJob).toBeDefined();
    expect(initialJob?.status).toBe('PENDING');
    expect(initialJob?.name).toBe('sms');
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
    await request(app.getHttpServer())
      .post('/jobs')
      .send({
        name: 'sms',
        interval: 10,
        data: { to: '+123', message: 'test' },
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/jobs')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
  });

  it('/jobs/:id (GET) - Fetch Job by ID', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/jobs')
      .send({
        name: 'sms',
        interval: 10,
        data: { to: '+123', message: 'test' },
      })
      .expect(201);

    const jobId = createResponse.body.jobId;

    const response = await request(app.getHttpServer())
      .get(`/jobs/${jobId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', jobId);
    expect(response.body).toHaveProperty('name', 'sms');
  });
});
