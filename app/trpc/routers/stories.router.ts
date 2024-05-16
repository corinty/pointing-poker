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
  updateDescription: publicProcedure
    .input(updateDescriptionSchema)
    .mutation(async ({input: {description, id}, ctx: {user}}) => {
      const story = await db
        .update(stories)
        .set({description})
        .where(eq(stories.id, id))
        .returning()
        .then((stories) => stories[0]);

      emitter.emit('roomUpdate', {actorId: user?.id, roomId: story.roomId});

      return story;
    }),
  submitVote: publicProcedure
    .input(insertVoteSchema.merge(z.object({roomId: z.string()})))
    .mutation(async ({input: {storyId, points, userId, roomId}, ctx}) => {
      const {user} = ctx;
      await db
        .insert(votes)
        .values({
          storyId,
          userId,
          points,
        })
        .onConflictDoUpdate({
          set: {
            points,
          },
          target: [votes.storyId, votes.userId],
        })
        .returning()
        .then((a) => a.at(0));

      emitter.emit('roomUpdate', {roomId, actorId: user?.id || ''});
      const submittedVotes = await db.query.votes.findMany({
        where: (votes, {eq}) => eq(votes.storyId, storyId),
      });

      return submittedVotes;
    }),
};
