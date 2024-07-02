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
import {PresentUser, User} from '~/db/users.repository.server';
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

export function usePresentUsers(): Array<PresentUser> {
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

  const streamRoute = `/user/presence?route=${encodeURIComponent(route)}`;

  const userStream = useEventSource(streamRoute, {
    event: 'users',
  });

  const userPing = useEventSource(streamRoute, {
    event: 'userPing',
  });

  useEffect(() => {
    if (!userPing) return;
    joinRoom(route);
  }, [userPing, route]);

  if (!userStream) return [];

  return parse<Array<User>>(userStream);
}
