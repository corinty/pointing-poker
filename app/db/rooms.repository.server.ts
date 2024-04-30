import {eq} from 'drizzle-orm';
import {db} from './drizzle.server';
import {rooms} from './schema/rooms';
import {stories} from './schema/stories';

export const createRoom = async (roomId: string) => {
  await db.insert(rooms).values({id: roomId}).onConflictDoNothing();
  const story = await db.insert(stories).values({roomId}).returning();

  await db
    .update(rooms)
    .set({activeStoryId: story[0].id})
    .where(eq(rooms.id, roomId))
    .returning();

  const room = await getRoom(roomId);

  if (!room) throw new Error('Error creating room');
  return room;
};

export const getRoom = async (roomId: string) => {
  const room = await db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      activeStory: {
        with: {
          votes: {
            columns: {
              points: true,
              userId: true,
            },
            with: {
              user: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return room;
};
