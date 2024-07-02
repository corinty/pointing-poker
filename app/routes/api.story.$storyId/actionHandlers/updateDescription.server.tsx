import {ActionFunctionArgs, json} from '@remix-run/node';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '~/db/drizzle.server';
import {stories} from '~/db/schema/stories';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {emitter} from '~/services/emitter.server';
import {parseRequestFormData} from '~/utils/formData';

export const updateDescriptionSchema = z.object({
  description: z.string(),
});

export async function updateDescription({request, params}: ActionFunctionArgs) {
  const {storyId} = params;
  if (!storyId) throw new Error('Missing storyId');

  const user = await requireAuthenticatedUser(request);

  const {description} = await parseRequestFormData(
    request,
    updateDescriptionSchema,
  );

  const story = await db
    .update(stories)
    .set({description})
    .where(eq(stories.id, Number(storyId)))
    .returning()
    .then((stories) => stories[0]);

  emitter.emit('roomUpdate', {actorId: user?.id, roomId: story.roomId});

  return json({story});
}
