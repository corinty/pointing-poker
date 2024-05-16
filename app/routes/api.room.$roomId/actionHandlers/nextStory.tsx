import {ActionFunctionArgs, json} from '@remix-run/node';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '~/db/drizzle.server';
import {rooms} from '~/db/schema/rooms';
import {createStory} from '~/db/stories.repository.server';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {emitter} from '~/services/emitter.server';
import {parseRequestFormData} from '~/utils/formData';

export const nextStorySchema = z.object({
  roomId: z.string(),
});

export async function nextStory({request}: ActionFunctionArgs) {
  const user = await requireAuthenticatedUser(request);
  const {roomId} = await parseRequestFormData(request, nextStorySchema);

  const {id: storyId} = await createStory(roomId);

  await db
    .update(rooms)
    .set({activeStoryId: storyId, displayVotes: false})
    .where(eq(rooms.id, roomId))
    .returning()
    .then((a) => a[0]);

  emitter.emit('roomUpdate', {roomId, actorId: user.id});

  return json({ok: true});
}
