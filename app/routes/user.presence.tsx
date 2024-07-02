import {ActionFunctionArgs, LoaderFunctionArgs, json} from '@remix-run/node';
import {eventStream} from 'remix-utils/sse/server';
import {authenticator, requireAuthenticatedUser} from '~/services/auth.server';
import {stringify} from 'superjson';

import {remember} from '@epic-web/remember';
import {zfd} from 'zod-form-data';
import {z} from 'zod';
import {loaderTrpc} from '~/trpc/routers/_app';
import {emitter} from '~/services/emitter.server';
import {
  User,
  getUsersAtRoute,
  updateUserPresence,
} from '~/db/users.repository.server';

export const Intent = z.enum(['Join', 'Leave']);
export type IntentEnum = z.infer<typeof Intent>;

const schema = zfd.formData({
  route: zfd.text(),
  intent: zfd.text(Intent),
});

export async function action(args: ActionFunctionArgs) {
  const {request} = args;
  const user = await requireAuthenticatedUser(request);

  const {route, intent} = schema.parse(await request.formData());

  if (intent === 'Join') {
    const usersAtRoute = await updateUserPresence({route, userId: user.id});
    return json({users: usersAtRoute});
  }

  if (intent === 'Leave') {
    await updateUserPresence({route: null, userId: user.id});
    return json({users: []});
  }
}

export async function loader({request}: LoaderFunctionArgs) {
  const user = await requireAuthenticatedUser(request);

  const url = new URL(request.url);
  const rawRoute = url.searchParams.get('route');
  const route = rawRoute ? decodeURIComponent(rawRoute) : null;
  if (!route) throw new Error('missing route search param');

  return eventStream(request.signal, (send) => {
    const handle = async (joinedRoute: string | null) => {
      if (joinedRoute !== decodeURIComponent(route)) return;
      const users = await getUsersAtRoute(route);

      send({
        event: 'users',
        data: stringify(users),
      });
    };
    const handleUserPing = async (userId: User['id']) => {
      if (userId !== user.id) return;

      send({
        event: 'userPing',
        data: new Date().toTimeString(),
      });
    };

    emitter.addListener('userPing', handleUserPing);
    emitter.addListener('userJoin', handle);
    handle(route);

    return () => {
      emitter.removeListener('userJoin', handle);
      emitter.removeListener('userPing', handleUserPing);
    };
  });
}
