import {remember} from '@epic-web/remember';
import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import {User} from '~/db/users.repository.server';

// Define your emitter's types like that:
// Key: Event name; Value: Listener function signature
export type MessageEvents = {
  roomUpdate: (args: {roomId: string; actorId?: string | null}) => void;
  storyUpdate: (storyId: number) => void;
  userJoin: (route: string | null) => void;
  userPing: (userId: User['id']) => void;
};

export const emitter = remember(
  'eventemitter',
  () => new EventEmitter() as TypedEmitter<MessageEvents>,
);
