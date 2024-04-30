import {z} from 'zod';
import {publicProcedure} from '../trpc.server';
import {createRoom, getRoom} from '~/db/rooms.repository.server';

export const roomsRouter = {
  get: publicProcedure.input(z.string()).query(async (opts) => {
    const {input} = opts;
    const room = await getRoom(input);
    if (room) return room;
    return createRoom(input);
  }),
};
