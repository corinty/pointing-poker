import {ActionFunctionArgs, json} from '@remix-run/node';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {loaderTrpc} from '~/trpc/routers/_app';

export enum VoteFields {
  Intent = 'intent',
  Points = 'points',
  StoryId = 'storyId',
}

export async function action(args: ActionFunctionArgs) {
  const trpc = await loaderTrpc(args.request);
  const user = await requireAuthenticatedUser(args.request);
  const formData = await args.request.formData();

  const {roomId} = args.params;

  const intent = String(formData.get(VoteFields.Intent));

  switch (intent) {
    case 'submitVote': {
      const points = String(formData.get(VoteFields.Points));
      const storyId = Number(formData.get(VoteFields.StoryId));
      if (!roomId || !storyId || !points)
        throw new Error('missing required paramaters');
      console.log(user.id, 'poitns', points, 'storyId', storyId);

      const votes = await trpc.story.submitVote({
        userId: user.id,
        roomId,
        points,
        storyId,
      });

      return json({votes});
    }
  }
}
