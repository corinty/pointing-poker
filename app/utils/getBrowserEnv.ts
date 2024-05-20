import {TypeOf} from 'zod';
import {zodEnv} from '~/services/env';

export function getBrowserEnv() {
  const env = getEnv();
  return {
    SITE_URL: env.SITE_URL,
  };
}
export function isBrowser() {
  return typeof window !== 'undefined';
}

export const browserEnv = zodEnv.pick({SITE_URL: true});

function getEnv(): TypeOf<typeof browserEnv> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return isBrowser() ? (window as any).ENV : process.env;
}
