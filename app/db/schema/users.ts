import {
  sqliteTable,
  foreignKey,
  text,
  unique,
  integer,
} from 'drizzle-orm/sqlite-core';
import {nanoid} from 'nanoid';

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey().notNull().default(nanoid()),
    createdAt: integer('created_at', {mode: 'timestamp_ms'}).$default(
      () => new Date(),
    ),
    name: text('name'),
    email: text('email').notNull().unique(),
    profilePicture: text('profile_picture'),
    role: text('role').default('anon').notNull(),
    lastSeenWhere: text('last_seen_where'),
    lastSeenAt: integer('last_seen_at', {mode: 'timestamp_ms'}).$default(
      () => new Date(),
    ),
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
