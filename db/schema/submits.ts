import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const submits = pgTable('submits', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  description: text('description'),
  tags: text('tags').array().default([]),
  image: text('image'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}); 