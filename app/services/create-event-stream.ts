import {eventStream} from 'remix-utils/sse/server';
import {MessageEvents, emitter} from './emitter.server';

type Events = keyof MessageEvents;

export function createEventStream(
  request: Request,
  eventName: Events | Events[],
) {
  const events = Array.isArray(eventName) ? eventName : [eventName];

  return eventStream(request.signal, (send) => {
    const handle = () => {
      send({
        data: String(Date.now()),
      });
    };

    events.forEach((event) => {
      emitter.addListener(event, handle);
    });

    return () => {
      events.forEach((event) => {
        emitter.removeListener(event, handle);
      });
    };
  });
}
