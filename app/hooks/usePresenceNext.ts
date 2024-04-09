import {useEffect, useMemo, useRef, useState} from 'react';

import {useCurrentUser} from './useCurrentUser';
import {SelectUser} from '~/db/schema/users';
import {humanId} from 'human-id';

export type LocalVotes = {
  [userId: string]: LocalVote;
};

export type LocalVote = Pick<SelectUser, 'name' | 'email'> & {
  vote: number | null;
  updatedAt: Date;
};
// TODO:: Move this to env
const anonMode = true;

export function usePresenceNext(
  roomId: string,
  initialVote: number | null = null,
) {}
