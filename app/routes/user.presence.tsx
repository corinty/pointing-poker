import {ActionFunctionArgs, LoaderFunctionArgs, json} from '@remix-run/node';
import {eventStream} from 'remix-utils/sse/server';
import {
  User,
  authenticator,
  requireAuthenticatedUser,
} from '~/services/auth.server';
import {stringify} from 'superjson';

import {remember} from '@epic-web/remember';
import {zfd} from 'zod-form-data';
import {z} from 'zod';
import {loaderTrpc} from '~/trpc/routers/_app';
import {emitter} from '~/services/emitter.server';
import {getUsersAtRoute} from '~/db/users.repository.server';

export const Intent = z.enum(['Join', 'Leave']);
export type IntentEnum = z.infer<typeof Intent>;

export const UserPresence = remember(
  'presenceMap',
  () => new Map<string, User>(),
);

const schema = zfd.formData({
  route: zfd.text(),
  intent: zfd.text(Intent),
});

export async function action(args: ActionFunctionArgs) {
  const {request} = args;
  const user = await authenticator.isAuthenticated(request);
  if (!user) return null;

  const trpc = await loaderTrpc(request);

  const {route, intent} = schema.parse(await request.formData());

  if (intent === 'Join') {
    const usersAtRoute = await trpc.users.updatePresence(route);
    return json({users: usersAtRoute});
  }

  if (intent === 'Leave') {
    UserPresence.delete(user.id);
    await trpc.users.updatePresence(null);
    return json({users: []});
  }
}

export async function loader({request}: LoaderFunctionArgs) {
  await requireAuthenticatedUser(request);

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

    emitter.addListener('userJoin', handle);
    handle(route);

    return () => {
      emitter.removeListener('userJoin', handle);
    };
  });
}
