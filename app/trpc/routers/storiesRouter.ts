import {z} from 'zod';
import {publicProcedure} from '../trpc.server';
import {db} from '~/db/drizzle.server';
import {insertVoteSchema, votes} from '~/db/schema/votes';
import {eq} from 'drizzle-orm';

export const storiesRouter = {
  clearAllVotes: publicProcedure.input(z.number()).mutation(async ({input}) => {
    return db.delete(votes).where(eq(votes.storyId, input));
  }),
  submitVote: publicProcedure
    .input(insertVoteSchema)
    .mutation(async ({input}) => {
      if (!input.points) throw new Error('no points submitted');
      const {userId, storyId, points} = input;
      console.log(input);

      return db
        .insert(votes)
        .values({
          userId,
          storyId,
          points,
          updatedAt: new Date().toUTCString(),
        })
        .onConflictDoUpdate({
          target: [votes.userId, votes.storyId],
          set: {
            points,
            updatedAt: new Date().toUTCString(),
          },
        });
    }),
};
