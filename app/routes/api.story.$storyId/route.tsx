import {ActionFunctionArgs, TypedResponse} from '@remix-run/node';
import {useFetcher} from '@remix-run/react';
import {namedAction} from 'remix-utils/named-action';
import {z} from 'zod';
import {Story, updateDescriptionSchema} from '~/db/schema/stories';
import {updateDescription} from './actionHandlers/updateDescription.server';
import {submitVote} from './actionHandlers/submitVote.server';
import {clearVotes} from './actionHandlers/clearVotes.server';

export enum VoteFields {
  Action = 'action',
  Points = 'points',
  StoryId = 'storyId',
  RoomId = 'roomId',
}

const actionPath = (storyId: Story['id']) => `/api/story/${storyId}`;

const IntentEnums = z.enum(['updateDescription', 'submitVote', 'clearVotes']);

export type StoryIntent = z.infer<typeof IntentEnums>;

type ActionResolvers<T extends string> = Record<
  T,
  () => Promise<TypedResponse<unknown>>
>;

export async function action(args: ActionFunctionArgs) {
  return namedAction<ActionResolvers<StoryIntent>>(args.request, {
    submitVote: () => submitVote(args),
    updateDescription: () => updateDescription(args),
    clearVotes: () => clearVotes(args),
  });
}

export function useUpdateStoryDescription({
  description: remoteDescription,
  storyId,
}: {
  description: string;
  storyId: number;
}) {
  const {submit, formData} = useFetcher();

  const mutate = (description: z.infer<typeof updateDescriptionSchema>) => {
    submit(
      {
        ...description,
        intent: 'updateDescription',
      },
      {
        action: actionPath(storyId),
        method: 'POST',
      },
    );
  };

  const description = formData?.has('description')
    ? String(formData?.get('description'))
    : remoteDescription;

  return [mutate, {description}] as const;
}

export function useClearVotesMutation() {
  const {submit} = useFetcher();

  const mutate = (storyId: number) => {
    submit(
      {
        intent: 'clearVotes',
      },
      {
        action: actionPath(storyId),
        method: 'POST',
      },
    );
  };

  return [mutate] as const;
}
