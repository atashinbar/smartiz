CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"last_login" timestamp with time zone,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"lockout_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"name" text,
	"surname" text,
	"national_id" text,
	"birth_date" date,
	"email" text,
	"user_type" text DEFAULT 'student' NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"app_language" text DEFAULT 'en',
	"fcm_token" text,
	"image_url" text,
	"profile_complete" integer DEFAULT 0 NOT NULL,
	"education_level" text,
	"parent_id" integer,
	"is_verified" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"credit" numeric(12, 2),
	"bank_account_number" text,
	"bank_sheba_number" text,
	"bank_card_number" text,
	"coin_balance" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admins_is_active" ON "admins" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_admins_role" ON "admins" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_admins_email" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_is_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_parent_id" ON "users" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_users_user_type" ON "users" USING btree ("user_type");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");