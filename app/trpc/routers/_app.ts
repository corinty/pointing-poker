import {t} from '~/trpc/trpc.server';
import {roomsRouter} from './rooms.router';
import {ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';
import {storiesRouter} from './stories.router';

export const appRouter = t.router({
  rooms: roomsRouter,
  story: storiesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

const createCaller = t.createCallerFactory(appRouter);

export const loaderTrpc = (args: LoaderFunctionArgs | ActionFunctionArgs) => {
  return createCaller({
    req: args.request,
    resHeaders: new Headers(),
    user: {
      // TODO actually extract user from args
      name: 'remixLoader',
    },
  });
};
