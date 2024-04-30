import {useState} from 'react';
interface LocalVotes {
  [userId: string]: string;
}
export function useVotes(roomId: string) {
  const [votes, setVotes] = useState<LocalVotes>({});

  const voteEntires = Object.entries(votes);

  const everyoneVoted = false;

  const submittedVotes = {};

  const averageVote = average([3, 2, 19]);
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
