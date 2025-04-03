ALTER TABLE "submits" ALTER COLUMN "title" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "submits" ALTER COLUMN "url" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "submits" ALTER COLUMN "tags" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "submits" ALTER COLUMN "image" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "submits" ALTER COLUMN "image" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "submits" ALTER COLUMN "status" SET DATA TYPE varchar(20);