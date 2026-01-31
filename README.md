<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Job Scheduling Application

A robust job scheduling application built with NestJS and PostgreSQL.

<p align="center">
  <a href="API.md">API Documentation</a> &bull;
  <a href="SCALABILITY.md">Scalability Design</a>
</p>

## Installation

First, install the project dependencies:

```bash
npm install
```

## Database Setup

1. Make sure you have PostgreSQL installed and running.
2. Create a new database named `jobs-scheduling`.

## Configuration

Create a `.env` file in the root directory (if it doesn't exist) and add the following environment variables:

```env
# Database Connection String
DATABASE_URL=postgres://username:password@localhost:5432/jobs-schedualing

# Scheduler Configuration
POLL_INTERVAL=5000      # Time in ms that the scheduler runs inside
BATCH_SIZE=10           # Max number of jobs executed per interval round
```

## Migration

Once the database and environment variables are set up, run the migrations to create the necessary tables:

```bash
npm run migrate
```

## Running the Application

You can now start the application:

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Documentation

For detailed information about the API endpoints, request shapes, and response examples, please refer to the [API Documentation](API.md).

## Scalability Design

To understand how this microservice handles high throughput (~6,000 req/min) and concurrency (~1,000 services), please read the [Scalability Design Document](SCALABILITY.md).

## Adding New Job Types

To add a new job type (e.g., `push-notification`), follow these steps:

1.  **Create a Validator**:
    Create a new validator file in `src/jobs/validators/` (e.g., `push-notification.validator.ts`) to define the expected data shape.

    ```typescript
    import { z } from 'zod';
    export const pushNotificationValidator = z.object({
      userId: z.string(),
      title: z.string(),
    });

    export type PushNotificationData = z.infer<
      typeof pushNotificationValidator
    >;
    ```

2.  **Implement Job Processor**:
    Create a new processor class in `src/jobs/processors/` that implements the `JobProcessor` interface.

    ```typescript
    import { JobProcessor } from '../interfaces/job-processor.interface';
    import { PushNotificationData } from '../validators/push-notification.validator';

    export class PushNotificationProcessor implements JobProcessor {
      constructor(private readonly data: PushNotificationData) {}
      async process(): Promise<void> {
        // Implement your logic here
        console.log('Sending push notification...', this.data);
      }
    }
    ```

3.  **Register in Factory**:
    Update `src/jobs/factories/job-processor.factory.ts` to instantiate your new processor when the job name matches.
    ```typescript
    // ... imports
    case 'push-notification':
      const data = pushNotificationValidator.parse(job.data);
      if (data) return new PushNotificationProcessor(data);
      return new InvalidJobProcessor({ jobId: job.id });
    ```
