import {z} from 'zod';
import {publicProcedure, t} from '~/trpc/trpc.server';
import {roomsRouter} from './rooms';
import {ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';

export const appRouter = t.router({
  rooms: roomsRouter,
  testMode: publicProcedure.input(z.string()).query((opts) => {
    return `Testing all of the ${opts.input}`;
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;

const createCaller = t.createCallerFactory(appRouter);

export const loaderTrpc = (args: LoaderFunctionArgs | ActionFunctionArgs) => {
  return createCaller({
    req: args.request,
    resHeaders: new Headers(),
    user: {
      name: 'remixLoader',
    },
  });
};
