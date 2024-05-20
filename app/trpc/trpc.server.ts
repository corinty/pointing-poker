import {Context} from './context.server';
import {initTRPC} from '@trpc/server';

export const t = initTRPC.context<Context>().create();

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  const {ctx} = opts;
  // if (!ctx.user) {
  // throw new TRPCError({code: 'UNAUTHORIZED'});
  // }
  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
