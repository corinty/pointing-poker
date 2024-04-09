import type {Config} from 'drizzle-kit';

export default {
  schema: './app/db/schema',
  out: './app/db/drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
