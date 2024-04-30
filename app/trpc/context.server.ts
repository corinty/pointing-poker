import {FetchCreateContextFnOptions} from '@trpc/server/adapters/fetch';
import {authenticator} from '~/services/auth.server';

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const user = await authenticator.isAuthenticated(req);
  return {req, resHeaders, user};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
