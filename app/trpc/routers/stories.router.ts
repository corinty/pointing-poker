import {z} from 'zod';
import {publicProcedure} from '../trpc.server';
import {db} from '~/db/drizzle.server';
import {insertVoteSchema, votes} from '~/db/schema/votes';
import {eq} from 'drizzle-orm';
import {stories, updateDescriptionSchema} from '~/db/schema/stories';
import {emitter} from '~/services/emitter.server';

export const storiesRouter = {
  clearAllVotes: publicProcedure.input(z.number()).mutation(async ({input}) => {
    return db.delete(votes).where(eq(votes.storyId, input));
  }),
};
