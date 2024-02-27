import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as rooms from './schema/rooms';
import * as stories from './schema/stories';
import * as users from './schema/users';
import * as votes from './schema/votes';

const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString!);

export const db = drizzle(client, {
  schema: {
    ...rooms,
    ...stories,
    ...users,
    ...votes,
  },
});
