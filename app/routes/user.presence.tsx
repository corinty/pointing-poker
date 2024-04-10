import {ActionFunctionArgs, LoaderFunctionArgs} from '@remix-run/node';
import {eventStream} from 'remix-utils/sse/server';
import {User, authenticator} from '~/services/auth.server';

import {remember} from '@epic-web/remember';
import {zfd} from 'zod-form-data';
import {z} from 'zod';

export const Intent = z.enum(['Join', 'Leave']);
export type IntentEnum = z.infer<typeof Intent>;

export const UserPresence = remember(
  'presenceMap',
  () =>
    new Map<
      string,
      User & {lastSeenWhere: string; lastSeenWhen: string; intent?: IntentEnum}
    >(),
);

const schema = zfd.formData({
  route: zfd.text(),
  intent: zfd.text(Intent),
});

export async function action({request}: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) return null;

  const {route, intent} = schema.parse(await request.formData());

  if (intent === 'Join') {
    UserPresence.set(user.id, {
      ...user,
      lastSeenWhere: route,
      lastSeenWhen: new Date().toISOString(),
      intent: 'Leave',
    });
  }

  if (intent === 'Leave') {
    UserPresence.delete(user.id);
  }

  return new Response(null, {
    status: 200,
  });
}

export async function loader({request}: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const route = url.searchParams.get('route');
  const fetchInterval = url.searchParams.get('fetchInterval') || '1000';
  const getPresentUsers = () =>
    JSON.stringify(
      Array.from(UserPresence.entries()).filter(([_, user]) => {
        if (route) {
          return user.lastSeenWhere === decodeURIComponent(route);
        }
        return true;
      }),
    );
  return eventStream(request.signal, function setup(send) {
    const emitEvent = () =>
      send({
        event: 'users',
        data: getPresentUsers(),
      });

    const interval = setInterval(() => {
      emitEvent();
    }, Number(fetchInterval));

    emitEvent();

    return () => {
      clearInterval(interval);
    };
  });
}
