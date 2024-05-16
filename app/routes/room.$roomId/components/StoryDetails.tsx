import {useLiveLoader} from '~/hooks/useLiveLoaderData';
import {loader} from '../route';
import {useUpdateStoryDescription} from '~/routes/api.story.$storyId/route';
import {useNextStoryMutation} from '~/routes/api.room.$roomId/route';

export function StoryDetails() {
  const {story, room} = useLiveLoader<typeof loader>();

  const [updateStoryDescription, {description}] = useUpdateStoryDescription({
    description: story.description,
    storyId: story.id,
  });

  const [nextStory] = useNextStoryMutation();

  return (
    <>
      <div className="flex gap-2">
        <textarea
          className="m-0 min-h-32 w-1/2"
          name="description"
          value={description}
          onChange={async (e) => {
            updateStoryDescription({description: e.target.value, id: story.id});
          }}
        />
        <button
          style={{height: '100%', margin: '0'}}
          onClick={async () => {
            nextStory(room.id);
          }}
        >
          Next Story
        </button>
      </div>
      <small className="opacity-50 mt-0">Story ID: {story.id}</small>
    </>
  );
}
