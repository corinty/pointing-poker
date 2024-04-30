import {useInterval, useWindowEvent} from '@mantine/hooks';
import {useEffect} from 'react';
import {useCurrentUser} from './useCurrentUser';
import {useBeforeUnload, useLocation} from '@remix-run/react';
import {Intent, UserPresence} from '../routes/user.presence';
import {getBrowserEnv} from '~/utils/getBrowserEnv';
import {useEventSource} from 'remix-utils/sse/react';
import {usersRouter} from '~/trpc/routers/users.router';
import {AppRouter, RouterOutput} from '~/trpc/routers/_app';

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

type PresentUser = RouterOutput['users']['usersAtRoute'][0];

export function usePresentUsers(): Map<PresentUser['id'], PresentUser> {
  const location = useLocation();
  const route = location.pathname;

  const interval = useInterval(() => {
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

  const usersArray = JSON.parse(userStream) as Array<PresentUser>;

  return new Map(usersArray.map((user) => [user.id, user]));
}
