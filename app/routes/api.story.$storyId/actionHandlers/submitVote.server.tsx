import {ActionFunctionArgs, json} from '@remix-run/node';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '~/db/drizzle.server';
import {rooms} from '~/db/schema/rooms';
import {users} from '~/db/schema/users';
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
    });

  const [votedUsers, presentUsers] = await Promise.all([
    db.query.votes
      .findMany({
        where: (votes, {eq}) => eq(votes.storyId, storyId),
        columns: {
          userId: true,
        },
      })
      .then((votedUsers) => votedUsers.map((user) => user.userId)),
    db.query.users.findMany({
      where: eq(users.lastSeenWhere, `/room/${roomId}`),
    }),
  ]);

  const allUsersVoted = presentUsers.every((user) =>
    votedUsers.includes(user.id),
  );
  if (allUsersVoted) {
    await db
      .update(rooms)
      .set({displayVotes: true})
      .where(eq(rooms.id, roomId));
  }

  emitter.emit('roomUpdate', {roomId, actorId: user.id});
  return json({allUsersVoted});
}
