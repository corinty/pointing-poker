import {useFetcher, useParams} from '@remix-run/react';
import {User} from '~/db/users.repository.server';

interface Props {
  userIds: Array<User['id']>;
  currentUserId: User['id'];
}
export function RefreshUsers({userIds, currentUserId}: Props) {
  const fetcher = useFetcher();
  const {roomId} = useParams();

  if (!roomId) throw new Error('roomId Param Required');

  return (
    <fetcher.Form
      className="pt-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (userIds.length == 0) userIds = [currentUserId];
        fetcher.submit(
          {userIds, roomId},
          {
            action: '/user/presence/ping',
            method: 'post',
            encType: 'application/json',
          },
        );
      }}
    >
      <button className="bg-neutral-700 enabled:hover:bg-cyan-500 text-white border-0">
        Refresh Users
      </button>
    </fetcher.Form>
  );
}
