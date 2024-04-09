import {
  sqliteTable,
  numeric,
  integer,
  text,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

import {stories} from './stories';
import {users} from './users';
import {relations} from 'drizzle-orm';
import {createInsertSchema} from 'drizzle-zod';

export const votes = sqliteTable(
  'votes',
  {
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .$default(() => new Date()),
    storyId: integer('story_id')
      .notNull()
      .references(() => stories.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    points: numeric('points'),
    userId: text('users')
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
