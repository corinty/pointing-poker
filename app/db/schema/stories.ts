import {InferSelectModel, relations} from 'drizzle-orm';
import {sqliteTable, text, numeric, integer} from 'drizzle-orm/sqlite-core';

import {rooms} from './rooms';
import {votes} from './votes';
import {createInsertSchema} from 'drizzle-zod';

export const stories = sqliteTable('stories', {
  id: integer('id', {mode: 'number'})
    .primaryKey({autoIncrement: true})
    .notNull(),
  createdAt: integer('created_at', {mode: 'timestamp_ms'})
    .notNull()
    .$default(() => new Date()),
  description: text('description').default('').notNull(),
  finalPoints: numeric('final_points'),
  roomId: text('room_id')
    .notNull()
    .references(() => rooms.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
});

export const storyRelations = relations(stories, ({one, many}) => ({
  room: one(rooms, {
    fields: [stories.roomId],
    references: [rooms.id],
  }),
  votes: many(votes),
}));

export type Story = InferSelectModel<typeof stories>;

export const updateDescriptionSchema = createInsertSchema(stories)
  .pick({id: true, description: true})
  .required({
    id: true,
    description: true,
  });
