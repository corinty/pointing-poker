import {ActionFunctionArgs, json} from '@remix-run/node';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {loaderTrpc} from '~/trpc/routers/_app';

export enum VoteFields {
  Action = 'action',
  Points = 'points',
  StoryId = 'storyId',
}

export async function action(args: ActionFunctionArgs) {
  const trpc = await loaderTrpc(args.request);
  const user = await requireAuthenticatedUser(args.request);
  const formData = await args.request.formData();

  const {storyId} = args.params;
  if (!storyId) throw new Error('Missing storyId');

  const formAction = String(formData.get(VoteFields.Action));

  switch (formAction) {
    case 'submitVote': {
      const points = String(formData.get(VoteFields.Points));
      const storyId = Number(formData.get(VoteFields.StoryId));
      if (!roomId || !storyId || !points)
        throw new Error('missing required paramaters');

      const votes = await trpc.story.submitVote({
        userId: user.id,
        roomId,
        points,
        storyId,
      });

      return json({votes});
    }
    case 'updateStory': {
      const description = String(formData.get('description'));
      console.log('The description values', {description});

      const story = await trpc.story.updateDescription({
        description,
        id: Number(storyId),
      });
      return json({story});
    }
    default: {
      return json({ok: false, error: 'No matched intent'});
    }
  }
}
