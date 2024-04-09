import {
  sqliteTable,
  foreignKey,
  text,
  unique,
  integer,
} from 'drizzle-orm/sqlite-core';
import {randomUUID} from 'crypto';

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().notNull().default(randomUUID()),
    createdAt: integer('created_at', {mode: 'timestamp_ms'}).default(
      new Date(),
    ),
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

export type SelectUser = typeof users.$inferSelect;
