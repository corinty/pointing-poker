import {useLiveLoader} from '~/hooks/useLiveLoaderData';
import {loader} from '../route';
import {usePresentUsers} from '~/hooks/usePresentUsers';

export function useVoteStats() {
  const {votes} = useLiveLoader<typeof loader>();
  const present = usePresentUsers();

  const voteArray = Object.values(votes).map((vote) => Number(vote.points));

  let everyoneVoted = true;

  const users = Object.fromEntries(
    Array.from(present.values()).map((user) => {
      const voteEntry = votes[user.id];
      if (!voteEntry) everyoneVoted = false;
      return [
        user.id,
        {
          ...user,
          vote: voteEntry
            ? {...voteEntry, updatedAt: new Date(voteEntry.updatedAt)}
            : null,
        },
      ];
    }),
  );

  const averageVote = average(voteArray);

  const hasConsensus = voteArray.every((vote) => vote === voteArray[0]);

  return {
    users,
    averageVote,
    everyoneVoted,
    hasConsensus,
    suggestedVote: Math.round(averageVote),
  };
}

function average(array: number[]) {
  return array.reduce((a, b) => a + b, 0) / array.length;
}
