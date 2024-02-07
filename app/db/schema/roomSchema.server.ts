import {
  pgTable,
  type AnyPgColumn,
  bigint,
  timestamp,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';
import {stories} from './schema.server';

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey().notNull().unique(),
  createdAt: timestamp('created_at', {withTimezone: true, mode: 'string'})
    .defaultNow()
    .notNull(),
  activeStoryId: bigint('active_story_id', {mode: 'number'}).references(
    (): AnyPgColumn => stories.id,
    {onDelete: 'set null', onUpdate: 'cascade'},
  ),
  displayVotes: boolean('display_votes').default(false).notNull(),
});

export const roomRelations = relations(rooms, ({many, one}) => ({
  stories: many(stories),
  activeStory: one(stories, {
    fields: [rooms.activeStoryId],
    references: [stories.id],
  }),
}));
