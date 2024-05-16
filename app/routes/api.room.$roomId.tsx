import {ActionFunctionArgs, TypedResponse, json} from '@remix-run/node';
import {requireAuthenticatedUser} from '~/services/auth.server';
import {loaderTrpc} from '~/trpc/routers/_app';
import {namedAction} from 'remix-utils/named-action';
import {useFetcher} from '@remix-run/react';
import {Room} from '~/db/rooms.repository.server';
import {db} from '~/db/drizzle.server';
import {rooms} from '~/db/schema/rooms';
import {emitter} from '~/services/emitter.server';
import {eq} from 'drizzle-orm';
import {zfd} from 'zod-form-data';

const showVotesSchema = zfd.formData({
  intent: zfd.text(),
  showVotes: zfd.checkbox(),
});

type Intents = 'nextStory' | 'showVotes';
type ActionResolvers<T extends string> = Record<
  T,
  () => Promise<TypedResponse<unknown>>
>;

export async function action(args: ActionFunctionArgs) {
  const trpc = await loaderTrpc(args.request);

  const user = await requireAuthenticatedUser(args.request);
  const {roomId} = args.params;
  if (!roomId) throw new Error('missing room Id');

  return namedAction<ActionResolvers<Intents>>(args.request, {
    async nextStory() {
      const story = await trpc.rooms.nextStory(args.params.roomId!);

      return json({success: true, story});
    },
    async showVotes() {
      const formData = await args.request.formData();
      const showVotes = JSON.parse(String(formData.get('showVotes')));

      console.log({
        showVotes: JSON.parse(String(showVotes) || 'false'),
        rawShowVotes: showVotes,
      });
      const room = await db
        .update(rooms)
        .set({displayVotes: showVotes})
        .where(eq(rooms.id, roomId))
        .returning();
      console.log({room});

      emitter.emit('roomUpdate', {
        roomId,
        actorId: user.id,
      });

      return json({success: true});
    },
  });
}

export function useShowVotesMutation(roomId: Room['id']) {
  const fetcher = useFetcher();

  const mutate = (showVotes: boolean) => {
    console.log('triggering', showVotes);
    fetcher.submit(
      {
        intent: 'showVotes',
        showVotes,
      },
      {
        action: `/api/room/${roomId}`,
        method: 'POST',
      },
    );
  };

  return {
    ...fetcher,
    mutate,
  };
}
