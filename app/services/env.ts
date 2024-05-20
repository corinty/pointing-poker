/* eslint-disable @typescript-eslint/no-namespace */
import {z} from 'zod';

export const zodEnv = z.object({
  //Site Info
  SITE_URL: z.string(),
  // Database
  DATABASE_URL: z.string(),
  // Cloudflare
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  // Secret
  SESSION_SECRET: z.string(),
});
