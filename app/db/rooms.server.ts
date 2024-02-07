import {eq} from 'drizzle-orm';
import {db} from './drizzle.server';
import {rooms} from './schema/roomSchema.server';
import {stories} from './schema/schema.server';

export const createRoom = async (roomId: string) => {
  await db.insert(rooms).values({id: roomId}).onConflictDoNothing();
  const story = await db.insert(stories).values({roomId}).returning();

  return db
    .update(rooms)
    .set({activeStoryId: story[0].id})
    .where(eq(rooms.id, roomId));
};

export const getRoom = async (roomId: string) =>
  db.query.rooms.findFirst({
    where: eq(rooms.id, roomId),
    with: {
      activeStory: true,
    },
  });
