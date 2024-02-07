import {db} from './drizzle.server';
import {stories} from './schema/schema.server';

export async function createStory(roomId: string) {
  return db.insert(stories).values({roomId});
}
