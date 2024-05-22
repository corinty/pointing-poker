import {useLiveLoader} from '~/hooks/useLiveLoaderData';
import {loader} from '../route';
import {usePresentUsers} from '~/hooks/usePresentUsers';
import {useFetchers} from '@remix-run/react';
import {VoteFields} from '~/routes/api.story.$storyId/route';
import {PresentUser, User} from '~/db/users.repository.server';

export function useVoteStats() {
  const {user, votes} = useLiveLoader<typeof loader>();
  const fetchers = useFetchers();

  const inFlightVote = fetchers
    .find((fetcher) => fetcher.key == 'submitVote')
    ?.formData?.get(VoteFields.Points);

  if (inFlightVote && user) {
    const {id} = user;
    votes[id] = {
      updatedAt: new Date().toTimeString(),
      points: String(inFlightVote),
      userId: id,
    };
  }
  const submissions = Object.values(votes);
  const presentUsers = usePresentUsers();

  const voteArray = submissions.map((vote) => Number(vote.points));

  let everyoneVoted = true;

  const users = Object.fromEntries(
    presentUsers.map((presentUser) => {
      const {id} = presentUser;
      const voteEntry = votes[id];

      if (!voteEntry) everyoneVoted = false;

      return [
        id,
        {
          ...presentUser,
          vote: voteEntry
            ? {
                ...voteEntry,
                updatedAt: new Date(voteEntry.updatedAt),
              }
            : null,
        },
      ];
    }),
  );

  const rawAverageVote = average(voteArray);

  interface VoteSummary {
    value: string;
    frequency: number;
    percentage: number;
  }
  const voteSpread = Object.values(
    submissions.reduce((acc, cur) => {
      if (!cur.points) return acc;

      if (!acc[cur.points]) {
        //if first occurence of value setup default values
        acc[cur.points] = {value: cur.points, frequency: 0, percentage: 0};
      }

      acc[cur.points].frequency = acc[cur.points].frequency + 1;
      acc[cur.points].percentage = Math.round(
        (acc[cur.points].frequency / submissions.length) * 100,
      );

      return acc;
    }, {} as Record<string, VoteSummary>),
  ).sort((a, b) => b.frequency - a.frequency);

  const hasConsensus = voteArray.every((vote) => vote === voteArray[0]);

  return {
    users,
    averageVote:
      rawAverageVote % 1 == 0 ? rawAverageVote : rawAverageVote.toFixed(2),
    everyoneVoted,
    submissions,
    hasConsensus,
    suggestedVote: Math.round(rawAverageVote),
    voteSpread,
  };
}

function average(array: number[]) {
  return array.length > 0 ? array.reduce((a, b) => a + b, 0) / array.length : 0;
}
