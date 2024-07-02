import {TypeOf} from 'zod';
import {zodEnv} from '~/services/env';

export function getBrowserEnv() {
  return {};
}
export function isBrowser() {
  return typeof window !== 'undefined';
}

function getEnv(): TypeOf<typeof browserEnv> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return isBrowser() ? (window as any).ENV : process.env;
}
