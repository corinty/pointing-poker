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
import {requestToObj} from '~/utils/formData';
import {z} from 'zod';
import {
  updateDisplayVotes,
  updateDisplayVotesSchema,
} from './actionHandlers/updateDisplayVotes';
import {nextStory, nextStorySchema} from './actionHandlers/nextStory';

type ActionResolvers<T extends string> = Record<
  T,
  () => Promise<TypedResponse<unknown>>
>;

const IntentsEnum = z.enum(['nextStory', 'updateDisplayVotes']);

type Intents = z.infer<typeof IntentsEnum>;

const actionPath = (roomId: Room['id']) => `/api/room/${roomId}`;

export async function action(args: ActionFunctionArgs) {
  const {roomId} = args.params;
  if (!roomId) throw new Error('missing room Id');

  return namedAction<ActionResolvers<Intents>>(args.request, {
    nextStory: () => nextStory(args),
    updateDisplayVotes: () => updateDisplayVotes(args),
  });
}

export function useDisplayVotesMutaiton(roomId: Room['id']) {
  const {submit} = useFetcher();

  const mutate = (
    displayVotes: z.infer<typeof updateDisplayVotesSchema>['displayVotes'],
  ) => {
    submit(
      {
        intent: 'updateDisplayVotes',
        displayVotes,
      },
      {
        action: actionPath(roomId),
        method: 'POST',
      },
    );
  };

  return [mutate] as const;
}

export function useNextStoryMutation() {
  const {submit} = useFetcher();

  const mutate = (roomId: z.infer<typeof nextStorySchema>['roomId']) => {
    submit(
      {
        roomId,
        intent: 'nextStory',
      },
      {
        action: actionPath(roomId),
        method: 'POST',
      },
    );
  };

  return [mutate] as const;
}
