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
      <p className="underline">Refresh Users</p>
    </fetcher.Form>
  );
}
