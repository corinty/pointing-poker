import {
  pgTable,
  type AnyPgColumn,
  foreignKey,
  bigint,
  timestamp,
  text,
  numeric,
  uuid,
  unique,
  bigserial,
} from 'drizzle-orm/pg-core';
import {InferSelectModel, relations} from 'drizzle-orm';

import {rooms} from './roomSchema.server';

export * from './roomSchema.server';

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

export const storyRelations = relations(stories, ({one}) => ({
  room: one(rooms, {
    fields: [stories.roomId],
    references: [rooms.id],
  }),
}));

export type Story = InferSelectModel<typeof stories>;

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
  users: uuid('users')
    .notNull()
    .references(() => users.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
});

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().notNull(),
    createdAt: timestamp('created_at', {withTimezone: true, mode: 'string'}),
    name: text('name'),
    email: text('email'),
  },
  (table) => {
    return {
      usersIdFkey: foreignKey({
        columns: [table.id],
        foreignColumns: [table.id],
        name: 'users_id_fkey',
      })
        .onUpdate('cascade')
        .onDelete('cascade'),
      usersEmailKey: unique('users_email_key').on(table.email),
    };
  },
);
