import {LoaderFunctionArgs} from '@remix-run/node';
import {eventStream} from 'remix-utils/sse/server';
import {authenticator} from '~/services/auth.server';
import {emitter} from '~/services/emitter.server';

export async function loader({request, params}: LoaderFunctionArgs) {
  if (!params.roomId) throw new Error('missing roomId');
  const user = await authenticator.isAuthenticated(request);

  return eventStream(request.signal, (send) => {
    const handle = ({roomId, actorId}: {roomId: string; actorId: string}) => {
      // Only send events if the room update is for the room we are subscribed to
      if (roomId !== params.roomId) return;

      // Only send an event stream of the update is triggered by another user
      if (actorId === user?.id) return;
      send({
        data: String(Date.now()),
      });
    };

    emitter.addListener('roomUpdate', handle);

    return () => {
      emitter.removeListener('roomUpdate', handle);
    };
  });
}
