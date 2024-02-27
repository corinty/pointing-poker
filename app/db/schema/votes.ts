import {
  pgTable,
  bigint,
  timestamp,
  numeric,
  uuid,
  primaryKey,
} from 'drizzle-orm/pg-core';

import {stories} from './stories';
import {users} from './users';
import {relations} from 'drizzle-orm';
import {createInsertSchema} from 'drizzle-zod';

export const votes = pgTable(
  'votes',
  {
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
  },
  (table) => ({
    pk: primaryKey({columns: [table.userId, table.storyId]}),
  }),
);

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

export const insertVoteSchema = createInsertSchema(votes).pick({
  points: true,
  storyId: true,
  userId: true,
});
