import {z} from 'zod';
import {publicProcedure, t} from '~/trpc/trpc.server';
import {roomsRouter} from './rooms';

export const appRouter = t.router({
  rooms: roomsRouter,
  testMode: publicProcedure.input(z.string()).query((opts) => {
    return `Testing all of the ${opts.input}`;
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = t.createCallerFactory(appRouter);
