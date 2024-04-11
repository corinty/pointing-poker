import {remember} from '@epic-web/remember';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';

// Define your emitter's types like that:
// Key: Event name; Value: Listener function signature
export type MessageEvents = {
  roomUpdate: () => void;
  userJoin: () => void;
  anotherOne: (data: boolean) => boolean;
};

export const emitter = remember(
  'eventemitter',
  () => new EventEmitter() as TypedEmitter<MessageEvents>,
);
