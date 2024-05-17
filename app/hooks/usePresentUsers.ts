import {useInterval, useWindowEvent} from '@mantine/hooks';
import {useEffect} from 'react';
import {useCurrentUser} from './useCurrentUser';
import {useBeforeUnload, useLocation} from '@remix-run/react';
import {Intent, UserPresence} from '../routes/user.presence';
import {getBrowserEnv} from '~/utils/getBrowserEnv';
import {useEventSource} from 'remix-utils/sse/react';
import {usersRouter} from '~/trpc/routers/users.router';
import {AppRouter, RouterOutput} from '~/trpc/routers/_app';
import {parse} from 'superjson';
import {User} from '~/db/users.repository.server';
const presenceURL = '/user/presence';

function leaveRoom() {
  const body = new FormData();
  body.append('route', '/bye-bye');
  body.append('intent', Intent.Enum.Leave);
  void fetch(presenceURL, {
    method: 'POST',
    credentials: 'include',
    body,
  });
}

function joinRoom(route: string) {
  const body = new FormData();
  body.append('route', route);
  body.append('intent', Intent.Enum.Join);
  void fetch(presenceURL, {
    method: 'POST',
    credentials: 'include',
    body,
  });
}

export function usePresentUsers(): Map<User['id'], User> {
  const location = useLocation();
  const route = location.pathname;

  const interval = useInterval(() => {
    if (!document.hasFocus()) return;
    joinRoom(route);
  }, 300000);

  useEffect(() => {
    if (!interval.active) {
      joinRoom(route);
      interval.start();
    }
    return () => {
      interval.stop();
      leaveRoom();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useBeforeUnload(() => {
    interval.stop();
    leaveRoom();
  });

  useWindowEvent('focus', () => joinRoom(route));

  const streamUrl = new URL(presenceURL, getBrowserEnv().SITE_URL);

  streamUrl.searchParams.set('route', encodeURIComponent(route));

  const userStream = useEventSource(streamUrl.href, {
    event: 'users',
  });

  if (!userStream) return new Map();

  const usersArray = parse<Array<User>>(userStream);

  return new Map(usersArray.map((user) => [user.id, user]));
}
