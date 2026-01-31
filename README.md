<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Job Scheduling Application

A robust job scheduling application built with NestJS and PostgreSQL.

## Installation

First, install the project dependencies:

```bash
npm install
```

## Database Setup

1. Make sure you have PostgreSQL installed and running.
2. Create a new database named `jobs-schedualing`.

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
