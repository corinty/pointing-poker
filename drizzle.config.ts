import type {Config} from 'drizzle-kit';

export default {
  dialect: 'sqlite',
  schema: './app/db/schema',
  out: './app/db/drizzle',
  dbCredentials: {
    url: `file:${process.env.DATABASE_URL}`,
  },
} satisfies Config;
