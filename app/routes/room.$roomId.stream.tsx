import {LoaderFunctionArgs} from '@remix-run/node';
import {eventStream} from 'remix-utils/sse/server';
import {emitter} from '~/services/emitter.server';

export async function loader({request, params}: LoaderFunctionArgs) {
  if (!params.roomId) throw new Error('missing roomId');

  return eventStream(request.signal, (send) => {
    const handle = (roomId: string) => {
      if (roomId !== roomId) return;
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
