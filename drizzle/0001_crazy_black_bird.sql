CREATE TABLE "recordings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recordings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" integer DEFAULT extract(epoch from now()) NOT NULL,
	"updated_at" integer DEFAULT extract(epoch from now()) NOT NULL,
	"user" integer,
	"file_url" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "streaks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user" integer,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_recorded_at" integer
);
--> statement-breakpoint
ALTER TABLE "recordings" ADD CONSTRAINT "recordings_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;