import {db} from './drizzle.server';
import {Story} from './schema/stories';

export async function getStory(storyId: Story['id']) {
  return db.query.stories.findFirst({
    where: (stories, {eq}) => eq(stories.id, storyId),
    with: {votes: true},
  });
}
