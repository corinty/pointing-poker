import {ActionFunctionArgs, json} from '@remix-run/node';
import {inArray} from 'drizzle-orm';
import {z} from 'zod';
import {db} from '~/db/drizzle.server';
import {users} from '~/db/schema/users';
import {emitter} from '~/services/emitter.server';

const userRefreshSchema = z.object({
  roomId: z.string(),
  userIds: z.array(z.string()),
});

export async function action({request}: ActionFunctionArgs) {
  const {roomId, userIds} = userRefreshSchema.parse(await request.json());

  await db
    .update(users)
    .set({lastSeenWhere: null})
    .where(inArray(users.id, userIds));

  emitter.emit('userJoin', `/room/${roomId}`);

  userIds.forEach((id) => {
    emitter.emit('userPing', id);
  });

  return json({ok: true});
}
