import {LoaderFunctionArgs} from '@remix-run/node';
import {createEventStream} from '~/services/create-event-stream';

export async function loader({request}: LoaderFunctionArgs) {
  return createEventStream(request, ['roomUpdate', 'userJoin']);
}
