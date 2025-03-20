ALTER TABLE "categories" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "name";