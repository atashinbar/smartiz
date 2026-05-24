CREATE TABLE "otp" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"type" text NOT NULL,
	"user_type" text NOT NULL,
	"code_hash" text NOT NULL,
	"authentication_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_otp_phone" ON "otp" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_otp_authentication_id" ON "otp" USING btree ("authentication_id");--> statement-breakpoint
CREATE INDEX "idx_otp_expires_at" ON "otp" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_otp_type_user_type" ON "otp" USING btree ("type","user_type");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_national_id_unique" UNIQUE("national_id");