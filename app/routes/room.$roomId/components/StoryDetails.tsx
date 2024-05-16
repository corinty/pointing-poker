import {useLiveLoader} from '~/hooks/useLiveLoaderData';
import {loader} from '../route';
import {useFetcher} from '@remix-run/react';

export function StoryDetails() {
  const {story} = useLiveLoader<typeof loader>();

  const {submit, formData} = useFetcher();

  const description = formData?.has('description')
    ? String(formData.get('description'))
    : story?.description;

  return (
    <>
      <div className="flex gap-2">
        <textarea
          className="m-0 min-h-32 w-1/2"
          name="description"
          value={description}
          onChange={async (e) => {
            const value = e.target.value;
            submit(
              {
                description: value,
                intent: 'updateStory',
              },
              {
                action: `/api/story/${story.id}`,
                method: 'POST',
              },
            );
          }}
        />
        <button
          style={{height: '100%', margin: '0'}}
          onClick={async () => {
            // await nextStoryMutation.mutateAsync(roomId);
            // revalidate();
            submit(
              {intent: 'nextStory'},
              {
                action: `/room/${story.roomId}/update`,
                method: 'POST',
              },
            );
          }}
        >
          Next Story
        </button>
      </div>
      <small className="opacity-50 mt-0">Story ID: {story.id}</small>
    </>
  );
}
