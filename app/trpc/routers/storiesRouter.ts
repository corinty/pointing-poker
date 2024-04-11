import {z} from 'zod';
import {publicProcedure} from '../trpc.server';
import {db} from '~/db/drizzle.server';
import {votes} from '~/db/schema/votes';
import {eq} from 'drizzle-orm';
import {stories, updateDescriptionSchema} from '~/db/schema/stories';
import {emitter} from '~/services/emitter.server';

export const storiesRouter = {
  clearAllVotes: publicProcedure.input(z.number()).mutation(async ({input}) => {
    return db.delete(votes).where(eq(votes.storyId, input));
  }),
  updateDescription: publicProcedure
    .input(updateDescriptionSchema)
    .mutation(async ({input: {description, id}}) => {
      const story = await db
        .update(stories)
        .set({description})
        .where(eq(stories.id, id))
        .returning();

      emitter.emit('roomUpdate');

      return story;
    }),
};
