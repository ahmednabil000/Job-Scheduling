CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'PENDING',
	"payload" jsonb NOT NULL,
	"schedule" numeric NOT NULL,
	"last_run_at" timestamp NOT NULL,
	"next_run_at" timestamp NOT NULL
);
