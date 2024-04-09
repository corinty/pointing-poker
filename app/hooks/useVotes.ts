import {useMemo, useState} from 'react';
import {useCurrentUser} from './useCurrentUser';
import {humanId} from 'human-id';

// TODO:: Move this to env
const anonMode = true;

export function useVotes(roomId: string) {
  const anonId = useMemo(
    () => humanId({separator: ' ', adjectiveCount: 0}),
    [],
  );

  const user = useCurrentUser();

  const [votes, setVotes] = useState<LocalVotes>({});

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
    nextStory: () => {
      // TODO:: Next story
    },
  };
}

function average(array: number[]) {
  return array.reduce((a, b) => a + b, 0) / array.length;
}
