import {z} from 'zod';
import {publicProcedure} from '../trpc';
import {createRoom, getRoom} from '~/db/rooms.server';

export const roomsRouter = {
  get: publicProcedure.input(z.string()).query(async ({input}) => {
    const room = await getRoom(input);
    if (room) return room;
    return createRoom(input);
  }),
};
