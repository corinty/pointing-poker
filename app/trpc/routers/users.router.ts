import {z} from 'zod';
import {protectedProcedure} from '../trpc.server';
import {db} from '~/db/drizzle.server';
import {users} from '~/db/schema/users';
import {eq} from 'drizzle-orm';
import {emitter} from '~/services/emitter.server';

export const usersRouter = {
  updatePresence: protectedProcedure
    .input(z.string().nullable())
    .query(async (opts) => {
      const {
        input,
        ctx: {user},
      } = opts;
      if (!user) return;

      const updatedUser = await db
        .update(users)
        .set({
          lastSeenWhere: input,
          lastSeenAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      emitter.emit('userJoin', input);
      if (!input) return updatedUser;

      return db.query.users.findMany({
        where: (users, {eq}) => eq(users.lastSeenWhere, input),
      });
    }),
  usersAtRoute: protectedProcedure.input(z.string()).query(async ({input}) => {
    return db.query.users.findMany({
      where: (users, {eq}) => eq(users.lastSeenWhere, input),
    });
  }),
};
