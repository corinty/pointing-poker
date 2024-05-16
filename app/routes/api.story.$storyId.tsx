import {ActionFunctionArgs, TypedResponse, json} from '@remix-run/node';
import {namedAction} from 'remix-utils/named-action';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {loaderTrpc} from '~/trpc/routers/_app';

export enum VoteFields {
  Action = 'action',
  Points = 'points',
  StoryId = 'storyId',
  RoomId = 'roomId',
}

type Intents = 'updateStory' | 'submitVote';
type ActionResolvers<T extends string> = Record<
  T,
  () => Promise<TypedResponse<unknown>>
>;

export async function action(args: ActionFunctionArgs) {
  const trpc = await loaderTrpc(args.request);
  const user = await requireAuthenticatedUser(args.request);
  const formData = await args.request.formData();

  const {storyId} = args.params;
  if (!storyId) throw new Error('Missing storyId');

  return namedAction<ActionResolvers<Intents>>(formData, {
    async submitVote() {
      const points = String(formData.get(VoteFields.Points));
      const roomId = String(formData.get(VoteFields.RoomId));
      if (!roomId || !points) throw new Error('missing required paramaters');

      const votes = await trpc.story.submitVote({
        userId: user.id,
        roomId,
        points,
        storyId: Number(storyId),
      });

      return json({votes});
    },
    async updateStory() {
      const description = String(formData.get('description'));

      console.log('updated story stuff');
      const story = await trpc.story.updateDescription({
        description,
        id: Number(storyId),
      });
      return json({story});
    },
  });
}
