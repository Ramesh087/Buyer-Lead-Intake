ALTER TABLE "buyers" DROP CONSTRAINT "buyers_owner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "buyers" ALTER COLUMN "owner_id" SET DATA TYPE text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "buyers" ADD CONSTRAINT "buyers_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
