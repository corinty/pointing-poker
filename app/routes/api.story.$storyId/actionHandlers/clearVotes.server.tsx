import {ActionFunctionArgs, json} from '@remix-run/node';
import {eq} from 'drizzle-orm';
import {db} from '~/db/drizzle.server';
import {rooms} from '~/db/schema/rooms';
import {votes} from '~/db/schema/votes';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {emitter} from '~/services/emitter.server';

export async function clearVotes({request, params}: ActionFunctionArgs) {
  const user = await requireAuthenticatedUser(request);

  if (!params.storyId) throw new Error('no storyId');
  const storyId = Number(params.storyId);

  await db.delete(votes).where(eq(votes.storyId, storyId));

  const room = await db
    .update(rooms)
    .set({displayVotes: false})
    .where(eq(rooms.activeStoryId, storyId))
    .returning()
    .then((a) => a[0]);

  emitter.emit('roomUpdate', {roomId: room.id, actorId: user.id});
  return json({ok: true});
}
