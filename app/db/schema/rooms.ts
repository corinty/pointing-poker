import {
  sqliteTable,
  integer,
  text,
  AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core';
import {relations} from 'drizzle-orm';
import {stories} from './stories';

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey().notNull(),
  createdAt: integer('created_at', {mode: 'timestamp_ms'})
    .notNull()
    .default(new Date()),
  activeStoryId: integer('active_story_id', {mode: 'number'}).references(
    (): AnySQLiteColumn => stories.id,
    {onDelete: 'set null', onUpdate: 'cascade'},
  ),
  displayVotes: integer('display_votes', {mode: 'boolean'})
    .default(false)
    .notNull(),
});

export const roomsRelations = relations(rooms, ({many, one}) => ({
  stories: many(stories),
  activeStory: one(stories, {
    fields: [rooms.activeStoryId],
    references: [stories.id],
  }),
}));

export type SelectRoom = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;
