import {humanId} from 'human-id';

export function generateRoomCode() {
  return humanId({
    separator: '-',
    capitalize: false,
  });
}
