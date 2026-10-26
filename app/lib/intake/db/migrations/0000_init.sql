CREATE TABLE "intake_audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"client_id" uuid,
	"invite_id" uuid,
	"submission_id" uuid,
	"detail" jsonb,
	CONSTRAINT "intake_audit_actor" CHECK ("intake_audit_log"."actor" in ('owner', 'client', 'system'))
);
--> statement-breakpoint
CREATE TABLE "intake_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_lookup" text NOT NULL,
	"contact_sealed" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "intake_clients_email_lookup_unique" UNIQUE("email_lookup")
);
--> statement-breakpoint
CREATE TABLE "intake_drafts" (
	"invite_id" uuid PRIMARY KEY NOT NULL,
	"revision" integer DEFAULT 0 NOT NULL,
	"answers_sealed" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intake_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"questionnaire_id" text NOT NULL,
	"questionnaire_version" text NOT NULL,
	"locale" text NOT NULL,
	"token_hash" text,
	"token_expires_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "intake_invites_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "intake_invites_status" CHECK ("intake_invites"."status" in ('invited', 'active', 'submitted', 'revoked')),
	CONSTRAINT "intake_invites_locale" CHECK ("intake_invites"."locale" in ('en', 'fi', 'sv'))
);
--> statement-breakpoint
CREATE TABLE "intake_login_codes" (
	"client_id" uuid PRIMARY KEY NOT NULL,
	"invite_id" uuid,
	"preauth_hash" text NOT NULL,
	"digest" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "intake_login_codes_attempts" CHECK ("intake_login_codes"."attempts" >= 0)
);
--> statement-breakpoint
CREATE TABLE "intake_pdfs" (
	"submission_id" uuid PRIMARY KEY NOT NULL,
	"pdf_sealed" jsonb NOT NULL,
	"pdf_digest" text NOT NULL,
	"byte_length" integer NOT NULL,
	"rendered_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intake_rate_limits" (
	"bucket" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intake_sessions" (
	"id_hash" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"client_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	CONSTRAINT "intake_sessions_kind" CHECK ("intake_sessions"."kind" in ('client', 'admin')),
	CONSTRAINT "intake_sessions_owner" CHECK (("intake_sessions"."kind" = 'admin') = ("intake_sessions"."client_id" is null))
);
--> statement-breakpoint
CREATE TABLE "intake_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"questionnaire_id" text NOT NULL,
	"questionnaire_version" text NOT NULL,
	"locale" text NOT NULL,
	"snapshot_sealed" jsonb NOT NULL,
	"snapshot_digest" text NOT NULL,
	"submitted_at" timestamp with time zone NOT NULL,
	"delete_after" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "intake_drafts" ADD CONSTRAINT "intake_drafts_invite_id_intake_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."intake_invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_invites" ADD CONSTRAINT "intake_invites_client_id_intake_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."intake_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_login_codes" ADD CONSTRAINT "intake_login_codes_client_id_intake_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."intake_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_login_codes" ADD CONSTRAINT "intake_login_codes_invite_id_intake_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."intake_invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_pdfs" ADD CONSTRAINT "intake_pdfs_submission_id_intake_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."intake_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_sessions" ADD CONSTRAINT "intake_sessions_client_id_intake_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."intake_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_submissions" ADD CONSTRAINT "intake_submissions_invite_id_intake_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."intake_invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intake_submissions" ADD CONSTRAINT "intake_submissions_client_id_intake_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."intake_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "intake_audit_at" ON "intake_audit_log" USING btree ("at");--> statement-breakpoint
CREATE INDEX "intake_invites_client" ON "intake_invites" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "intake_sessions_client" ON "intake_sessions" USING btree ("client_id");--> statement-breakpoint
CREATE UNIQUE INDEX "intake_submissions_invite" ON "intake_submissions" USING btree ("invite_id");--> statement-breakpoint
CREATE INDEX "intake_submissions_client" ON "intake_submissions" USING btree ("client_id");