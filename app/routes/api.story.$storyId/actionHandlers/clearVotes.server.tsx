import {ActionFunctionArgs, json} from '@remix-run/node';
import {eq} from 'drizzle-orm';
import {db} from '~/db/drizzle.server';
import {stories} from '~/db/schema/stories';
import {votes} from '~/db/schema/votes';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {emitter} from '~/services/emitter.server';

export async function clearVotes({request, params}: ActionFunctionArgs) {
  const user = await requireAuthenticatedUser(request);

  if (!params.storyId) throw new Error('no storyId');
  const storyId = Number(params.storyId);

  await db.delete(votes).where(eq(votes.storyId, storyId));

  const story = await db.query.stories.findFirst({
    where: eq(stories.id, storyId),
    columns: {roomId: true},
  });
  if (!story) throw new Error('no story found');

  emitter.emit('roomUpdate', {roomId: story.roomId, actorId: user.id});
  return json({ok: true});
}
