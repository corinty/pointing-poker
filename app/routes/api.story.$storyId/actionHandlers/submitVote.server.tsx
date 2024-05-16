import {ActionFunctionArgs, json} from '@remix-run/node';
import {z} from 'zod';
import {db} from '~/db/drizzle.server';
import {votes} from '~/db/schema/votes';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {emitter} from '~/services/emitter.server';
import {parseRequestFormData} from '~/utils/formData';

const submitVoteSchema = z.object({
  points: z.string(),
  roomId: z.string(),
});

export async function submitVote({request, params}: ActionFunctionArgs) {
  const user = await requireAuthenticatedUser(request);
  const storyId = Number(params.storyId);
  const {points, roomId} = await parseRequestFormData(
    request,
    submitVoteSchema,
  );

  await db
    .insert(votes)
    .values({
      storyId,
      userId: user.id,
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

  return json({votes: submittedVotes});
}
