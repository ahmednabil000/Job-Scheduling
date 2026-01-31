import * as d from 'drizzle-orm/pg-core';
import { PgDatabase } from 'drizzle-orm/pg-core';

const jobStatus = {
  Running: 'RUNNING',
  Pending: 'PENDING',
  Failed: 'FAILED',
};

export const jobs = d.pgTable(
  'jobs',
  {
    id: d.uuid().primaryKey().defaultRandom(),
    name: d.text('name').notNull(),
    type: d.text('type').notNull(),
    status: d
      .text('status')
      .$type<'PENDING' | 'RUNNING' | 'FAILED'>()
      .default('PENDING'),
    data: d.jsonb('data').notNull(),
    interval: d.real('interval').notNull(),
    lastRunAt: d.timestamp('last_run_at', { withTimezone: true }).notNull(),
    nextRunAt: d.timestamp('next_run_at', { withTimezone: true }).notNull(),
    createdAt: d.timestamp('created_at').notNull(),
  },
  (t) => ({
    pollingIndex: d.index('polling_idx').on(t.nextRunAt, t.status),
  }),
);

export type Job = typeof jobs.$inferSelect;
