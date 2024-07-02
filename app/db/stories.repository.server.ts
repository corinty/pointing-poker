import {db} from './drizzle.server';
import {Room} from './rooms.repository.server';
import {Story, stories} from './schema/stories';

export async function getStory(storyId: Story['id']) {
  return db.query.stories.findFirst({
    where: (stories, {eq}) => eq(stories.id, storyId),
    with: {
      votes: {
        columns: {
          createdAt: false,
          storyId: false,
        },
      },
    },
  });
}

export async function createStory(roomId: Room['id']) {
  return db
    .insert(stories)
    .values({roomId})
    .returning()
    .then((a) => a[0]);
}
