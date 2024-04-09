import type {Config} from 'drizzle-kit';

export default {
  schema: './app/db/schema',
  out: './app/db/drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: 'db.sql',
  },
} satisfies Config;
