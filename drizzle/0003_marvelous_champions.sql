ALTER TABLE "jobs" ALTER COLUMN "last_run_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "next_run_at" SET DATA TYPE timestamp with time zone;