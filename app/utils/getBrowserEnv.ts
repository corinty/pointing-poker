export function getBrowserEnv() {
  const env = getEnv();
  return {
    ANON_MODE: Boolean(env.ANON_MODE),
    SITE_URL: env.SITE_URL,
  };
}
export function isBrowser() {
  return typeof window !== 'undefined';
}

function getEnv() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return isBrowser() ? (window as any).ENV : process.env;
}
