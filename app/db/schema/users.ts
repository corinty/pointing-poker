import {
  pgTable,
  foreignKey,
  timestamp,
  text,
  uuid,
  unique,
} from 'drizzle-orm/pg-core';

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
