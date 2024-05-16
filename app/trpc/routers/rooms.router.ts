import {z} from 'zod';
import {publicProcedure} from '../trpc.server';
import {createRoom, getRoom} from '~/db/rooms.repository.server';
import {createStory} from '~/db/stories.repository.server';
import {db} from '~/db/drizzle.server';
import {rooms} from '~/db/schema/rooms';
import {eq} from 'drizzle-orm';
import {emitter} from '~/services/emitter.server';

export const roomsRouter = {
  get: publicProcedure.input(z.string()).query(async (opts) => {
    const {input} = opts;
    let room = await getRoom(input);

    if (!room) room = await createRoom(input);

    return room;
  }),
  nextStory: publicProcedure
    .input(z.string())
    .mutation(async ({input, ctx}) => {
      const {id} = await createStory(input);
      const {user} = ctx;

      const story = await db
        .update(rooms)
        .set({activeStoryId: id, displayVotes: false})
        .where(eq(rooms.id, input))
        .returning()
        .then((a) => a[0]);

      emitter.emit('roomUpdate', {roomId: input, actorId: user?.id || ''});

      return story;
    }),
};
