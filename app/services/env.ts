/* eslint-disable @typescript-eslint/no-namespace */
import {z} from 'zod';

export const zodEnv = z.object({
  // Database
  DATABASE_URL: z.string(),
  // Secret
  SESSION_SECRET: z.string(),
});
