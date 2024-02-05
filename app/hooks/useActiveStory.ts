import {useEffect, useState} from 'react';
import {Story, storyRepository} from '~/db/stories';
import {useRequireCurrentUser} from './useRequireCurrentUser';
import {usePresentUsers} from './usePresentUsers';
import {serverTimestamp} from 'firebase/firestore';

export function useActiveStory(roomId: string, activeStoryId?: string) {
  const [data, setData] = useState<Story | null>(null);
  const currentUser = useRequireCurrentUser();
  const {data: presentUsers} = usePresentUsers(roomId);

  useEffect(() => {
    if (!activeStoryId) return;

    const unsub = storyRepository.subscribe(roomId, activeStoryId, {
      next: (snapshot) => {
        if (!snapshot.exists()) return;

        setData(snapshot.data() as Story);
      },
    });

    return () => {
      unsub();
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
