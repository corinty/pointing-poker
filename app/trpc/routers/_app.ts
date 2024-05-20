import {t} from '~/trpc/trpc.server';
import {authenticator} from '~/services/auth.server';
import {inferRouterOutputs} from '@trpc/server';
import {usersRouter} from './users.router';

export const appRouter = t.router({
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterOutput = inferRouterOutputs<AppRouter>;

const createCaller = t.createCallerFactory(appRouter);

export const loaderTrpc = async (request: Request) => {
  const user = await authenticator.isAuthenticated(request);

  return createCaller({
    req: request,
    resHeaders: new Headers(),
    user,
  });
};
