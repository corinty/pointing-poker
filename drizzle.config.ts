import type {Config} from 'drizzle-kit';

export default {
  schema: './app/db/schema/schema.server.ts',
  out: './app/db/drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
