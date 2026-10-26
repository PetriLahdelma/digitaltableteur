-- One pending code per pre-auth cookie instead of per client (security review 2026-10-26).
-- Codes live 10 minutes, so pending ones are dropped rather than migrated.
DELETE FROM "intake_login_codes";--> statement-breakpoint
ALTER TABLE "intake_login_codes" DROP CONSTRAINT "intake_login_codes_pkey";--> statement-breakpoint
ALTER TABLE "intake_login_codes" ADD PRIMARY KEY ("preauth_hash");--> statement-breakpoint
CREATE INDEX "intake_login_codes_client" ON "intake_login_codes" USING btree ("client_id");
