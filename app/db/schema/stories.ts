import {InferSelectModel, relations} from 'drizzle-orm';
import {
  pgTable,
  type AnyPgColumn,
  timestamp,
  text,
  numeric,
  bigserial,
} from 'drizzle-orm/pg-core';

import {rooms} from './rooms';
import {votes} from './votes';

export const stories = pgTable('stories', {
  id: bigserial('id', {mode: 'number'}).primaryKey(),
  createdAt: timestamp('created_at', {withTimezone: true, mode: 'string'})
    .defaultNow()
    .notNull(),
  description: text('description').default(''),
  finalPoints: numeric('final_points'),
  roomId: text('room_id')
    .notNull()
    .references((): AnyPgColumn => rooms.id, {
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
