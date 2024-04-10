import {useInterval, useWindowEvent} from '@mantine/hooks';
import {useEffect} from 'react';
import {useCurrentUser} from './useCurrentUser';
import {useBeforeUnload} from '@remix-run/react';
import {Intent, UserPresence} from '../routes/user.presence';
import {getBrowserEnv} from '~/utils/getBrowserEnv';
import {useEventSource} from 'remix-utils/sse/react';

const presenceURL = '/user/presence';

type Presence = {
  [key: string]: typeof UserPresence extends Map<string, infer I> ? I : never;
};

function leaveRoom(doIt: boolean = false) {
  if (doIt) alert('stop the presses');
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

export function usePresenceUsers(route: string, fetchInterval: number = 1000) {
  const user = useCurrentUser();

  const interval = useInterval(() => {
    // joinRoom(route);
  }, 15000);

  useEffect(() => {
    if (!interval.active && user) {
      joinRoom(route);
      interval.start();
    }
    return () => {
      interval.stop();
      leaveRoom();
    };
  }, [user]);
  useBeforeUnload(() => {
    interval.stop();
    leaveRoom();
  });

  useWindowEvent('focus', () => joinRoom(route));

  const streamUrl = new URL(presenceURL, getBrowserEnv().SITE_URL);

  streamUrl.searchParams.set('route', encodeURIComponent(route));
  streamUrl.searchParams.set(
    'fetchInterval',
    fetchInterval ? fetchInterval.toString() : '1000',
  );

  const userStream = useEventSource(streamUrl.href, {
    event: 'users',
  });

  if (!userStream) return {} satisfies Presence;

  return Object.fromEntries(JSON.parse(userStream)) satisfies Presence;
}
