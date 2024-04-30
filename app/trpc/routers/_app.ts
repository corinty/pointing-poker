import {t} from '~/trpc/trpc.server';
import {roomsRouter} from './rooms.router';
import {storiesRouter} from './stories.router';
import {usersRouter} from './users.router';
import {authenticator} from '~/services/auth.server';
import {inferRouterOutputs} from '@trpc/server';

export const appRouter = t.router({
  rooms: roomsRouter,
  story: storiesRouter,
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
