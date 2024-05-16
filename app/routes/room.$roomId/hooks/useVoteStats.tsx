import {useLiveLoader} from '~/hooks/useLiveLoaderData';
import {loader} from '../route';
import {usePresentUsers} from '~/hooks/usePresentUsers';

export function useVoteStats() {
  const {votes} = useLiveLoader<typeof loader>();
  const present = usePresentUsers();

  const users = Object.fromEntries(
    Array.from(present.values()).map((user) => {
      const voteEntry = votes[user.id];
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

  return {users};
}
