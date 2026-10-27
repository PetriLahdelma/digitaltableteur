CREATE TABLE "intake_admin_challenges" (
	"preauth_hash" text PRIMARY KEY NOT NULL,
	"purpose" text NOT NULL,
	"challenge" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "intake_admin_challenges_purpose" CHECK ("intake_admin_challenges"."purpose" in ('register', 'authenticate'))
);
--> statement-breakpoint
CREATE TABLE "intake_admin_credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"transports" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "intake_admin_enrolments" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "intake_submissions_invite";--> statement-breakpoint
ALTER TABLE "intake_invites" ADD COLUMN "first_signed_in_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "intake_invites" ADD COLUMN "expiry_reminder_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "intake_invites" ADD COLUMN "reopened_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "intake_submissions" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "intake_submissions_invite_version" ON "intake_submissions" USING btree ("invite_id","version");