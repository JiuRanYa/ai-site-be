import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

// 定义categories表
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description')
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  tags: text('tags').array(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  image: text('image'),
}); 