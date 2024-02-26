import {db} from './drizzle.server';
import {stories} from './schema/schema.server';

export async function createStory(roomId: string) {
  return db.insert(stories).values({roomId});
}

export async function getStory(storyId: number) {
  const story = await db.query.stories.findFirst({
    where: (stories, {eq}) => eq(stories.id, storyId),
  });

  if (!story) throw new Error('Story not found');

  return story;
}
