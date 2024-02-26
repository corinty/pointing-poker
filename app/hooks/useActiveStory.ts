import {useEffect, useState} from 'react';
import {storyRepository} from '~/db/stories';
import {useRequireCurrentUser} from './useRequireCurrentUser';
import {usePresentUsers} from './usePresentUsers';
import {serverTimestamp} from 'firebase/firestore';
import {supabase} from '~/db/supabase';
import {Tables} from '~/db/database.types';
import type {Story} from '~/db/schema/schema.server';

export function useActiveStory(
  activeStoryId?: string,
  initalData: Tables<'stories'> | null = null,
) {
  const [data, setData] = useState<Story | null>(initalData);
  const currentUser = useRequireCurrentUser();
  const {data: presentUsers} = usePresentUsers(data?.final_points?.toString());
  const roomId = 'dancing-bear-jump';

  useEffect(() => {
    if (!activeStoryId) return;

    const changes = supabase
      .channel('changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stories',
          filter: `id=eq.${activeStoryId}`,
        },
        (payload) => {
          console.log('supabase change', payload.new);
        },
      )
      .subscribe();

    return () => {
      changes.unsubscribe();
    };
  }, [roomId, activeStoryId]);

  const submitVote = (userId: string, value: number) => {
    if (!activeStoryId) return;
    storyRepository.updateStory(roomId, activeStoryId, {
      [`votes.${userId}`]: {value, submittedAt: serverTimestamp()},
    });
  };

  if (!data || !activeStoryId) return {loading: true, submitVote};

  const voteEntires = Object.values(data.votes);

  const everyoneVoted = presentUsers?.every((user) => {
    return Object.keys(data.votes).includes(user.uid);
  });

  const averageVote = (() => {
    const votes = Object.values(data.votes).map((vote) => vote.value);

    if (votes.length == 0) return 0;

    return average(votes);
  })();

  const hasConsensus =
    presentUsers?.length == voteEntires.length &&
    voteEntires.every((vote) => vote.value == voteEntires[0]?.value);

  return {
    loading: false,
    data,
    toggleDisplayVotes: () => {
      storyRepository.updateStory(roomId, activeStoryId, {
        displayVotes: !data.displayVotes,
      });
    },
    setDisplayVotes: (value: boolean) => {
      storyRepository.updateStory(roomId, activeStoryId, {
        displayVotes: value,
      });
    },
    everyoneVoted,
    averageVote,
    hasConsensus,
    clearVotes: () => {
      storyRepository.clearVotes(roomId, activeStoryId);
      storyRepository.updateStory(roomId, activeStoryId, {displayVotes: false});
    },
    nextStory: () => storyRepository.createStory(roomId, {setActive: true}),
    submitVote,
    currentUserVote: data.votes[currentUser!.uid],
  };
}

function average(array: number[]) {
  return array.reduce((a, b) => a + b, 0) / array.length;
}
