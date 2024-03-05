import {useEffect, useMemo, useState} from 'react';
import {storyRepository} from '~/db/stories';
import {serverTimestamp} from 'firebase/firestore';
import {supabase} from '~/db/supabase';
import {useCurrentUser} from './useCurrentUser';
import {useSupabasePresence} from './useSupabasePresence';
import {humanId} from 'human-id';
import {LocalVote, LocalVotes as LocalVotes} from './usePresenceNext';
import {trpc} from '~/utils/trpc';

// TODO:: Move this to env
const anonMode = true;

export function useVotes(roomId: string) {
  const anonId = useMemo(
    () => humanId({separator: ' ', adjectiveCount: 0}),
    [],
  );

  const user = useCurrentUser();

  const [votes, setVotes] = useState<LocalVotes>({});

  const channel = useSupabasePresence(roomId, {
    key: anonMode ? anonId : user.uid,
    sync: (channel) => {
      const presenceState = channel.presenceState<LocalVote>();

      const nextState = Object.keys(presenceState).reduce((acc, key) => {
        const localVote = presenceState[key].at(0);

        if (!localVote) throw new Error('Error with syncing presence state');
        acc[key] = localVote;
        return acc;
      }, {} as LocalVotes);

      setVotes(nextState);
    },
    onConnect: () => {
      // TODO:: replace with server inital value
      boradcastLocalVote(null);
    },
  });

  function boradcastLocalVote(vote: number | null) {
    const msg = {
      vote,
      // TODO:: Get real user data
      name: anonMode ? anonId : 'Corin',
      email: null,
      updatedAt: new Date(),
    } satisfies LocalVote;

    channel?.track(msg);
  }
  const voteEntires = Object.values(votes).map((entry) => entry.vote);

  const everyoneVoted = voteEntires.every((vote) => vote !== null);

  const submittedVotes = voteEntires.filter(
    (vote): vote is number => vote !== null,
  );

  const averageVote = (() => {
    if (submittedVotes.length == 0) return 0;

    return average(submittedVotes);
  })();

  const hasConsensus = voteEntires.map((entry) => entry === voteEntires[0]);

  return {
    toggleDisplayVotes: () => {
      // TODO
    },
    setDisplayVotes: () => {
      // TODO
    },
    everyoneVoted,
    votes,
    submittedVotes,
    averageVote,
    hasConsensus,
    nextStory: () => storyRepository.createStory(roomId, {setActive: true}),
  };
}

function average(array: number[]) {
  return array.reduce((a, b) => a + b, 0) / array.length;
}
