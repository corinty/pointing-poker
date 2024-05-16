import {InferSelectModel, eq} from 'drizzle-orm';
import {db} from './drizzle.server';
import {rooms} from './schema/rooms';
import {createStory} from './stories.repository.server';

export const createRoom = async (roomId: Room['id']) => {
  await db.insert(rooms).values({id: roomId}).onConflictDoNothing();
  const story = await createStory(roomId);

  await db
    .update(rooms)
    .set({activeStoryId: story.id})
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
              updatedAt: true,
            },
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
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

export type Room = InferSelectModel<typeof rooms>;
