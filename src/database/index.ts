import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { jobs } from './job.schema';

export const db = drizzle(process.env.DATABASE_URL!);