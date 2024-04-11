import {eventStream} from 'remix-utils/sse/server';
import {MessageEvents, emitter} from './emitter.server';

export function createEventStream(
  request: Request,
  eventName: keyof MessageEvents,
) {
  return eventStream(request.signal, (send) => {
    const handle = () => {
      send({
        data: String(Date.now()),
      });
    };

    emitter.addListener(eventName, handle);

    return () => {
      emitter.removeListener(eventName, handle);
    };
  });
}
