import {z} from 'zod';
import {publicProcedure} from '../trpc.server';
import {db} from '~/db/drizzle.server';
import {insertVoteSchema, votes} from '~/db/schema/votes';
import {eq} from 'drizzle-orm';
import {stories, updateDescriptionSchema} from '~/db/schema/stories';
import {emitter} from '~/services/emitter.server';
import {rooms} from '~/db/schema/rooms';

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

      emitter.emit('storyUpdate', id);

      return story;
    }),
  submitVote: publicProcedure
    .input(insertVoteSchema.merge(z.object({roomId: z.string()})))
    .mutation(async ({input: {storyId, points, userId, roomId}}) => {
      console.log('we have the room Id');
      await db
        .insert(votes)
        .values({
          storyId,
          userId,
        })
        .onConflictDoUpdate({
          set: {
            points,
          },
          target: [votes.storyId, votes.userId],
        })
        .returning();

      emitter.emit('roomUpdate', roomId);
      const submittedVotes = await db.query.votes.findMany({
        where: (votes, {eq}) => eq(votes.storyId, storyId),
      });
      console.log('votes', submittedVotes);

      return submittedVotes;
    }),
};
