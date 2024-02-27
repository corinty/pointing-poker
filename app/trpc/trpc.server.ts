import {Context} from './context.server';
import {initTRPC} from '@trpc/server';

export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;
