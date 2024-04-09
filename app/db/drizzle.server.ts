import {drizzle} from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

import * as rooms from './schema/rooms';
import * as stories from './schema/stories';
import * as users from './schema/users';
import * as votes from './schema/votes';

const client = new Database(process.env.DATABASE_URL!);

export const db = drizzle(client, {
  schema: {
    ...rooms,
    ...stories,
    ...users,
    ...votes,
  },
});
