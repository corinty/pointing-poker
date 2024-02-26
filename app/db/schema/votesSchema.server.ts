import {pgTable, bigint, timestamp, numeric, uuid} from 'drizzle-orm/pg-core';

import {stories} from './storiesSchema.server';
import {users} from './schema.server';
import {relations} from 'drizzle-orm';

export const votes = pgTable('votes', {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint('id', {mode: 'number'}).primaryKey().notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'string',
  })
    .defaultNow()
    .notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  storyId: bigint('story_id', {mode: 'number'})
    .notNull()
    .references(() => stories.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
  points: numeric('points'),
  userId: uuid('users')
    .notNull()
    .references(() => users.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
});

export const votesRelations = relations(votes, ({one}) => ({
  story: one(stories, {
    fields: [votes.storyId],
    references: [stories.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
}));
