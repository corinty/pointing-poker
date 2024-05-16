import {ActionFunctionArgs, json} from '@remix-run/node';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '~/db/drizzle.server';
import {rooms} from '~/db/schema/rooms';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {emitter} from '~/services/emitter.server';
import {requestToObj} from '~/utils/formData';

export const updateDisplayVotesSchema = z.object({
  displayVotes: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('false'),
});

export async function updateDisplayVotes({
  request,
  params,
}: ActionFunctionArgs) {
  const user = await requireAuthenticatedUser(request);

  const {displayVotes} = updateDisplayVotesSchema.parse(
    await requestToObj(request),
  );

  const roomId = params.roomId!;

  await db
    .update(rooms)
    .set({displayVotes})
    .where(eq(rooms.id, roomId))
    .returning();

  emitter.emit('roomUpdate', {
    roomId,
    actorId: user.id,
  });

  return json({success: true});
}
