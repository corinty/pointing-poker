import {RealtimeChannel} from '@supabase/supabase-js';
import {useEffect, useMemo, useRef, useState} from 'react';

import {supabase} from '~/db/supabase';
import {useCurrentUser} from './useCurrentUser';
import {SelectUser} from '~/db/schema/users';
import {humanId} from 'human-id';

type LocalVoteMap = {
  [userId: string]: LocalVote;
};

type LocalVote = Pick<SelectUser, 'name' | 'email'> & {
  vote: number | null;
  updatedAt: Date;
};
// TODO:: Move this to env
const anonMode = true;

export function usePresenceNext(
  roomId: string,
  initialVote: number | null = null,
) {
  const roomRef = useRef<RealtimeChannel | null>(null);
  const anonId = useMemo(
    () => humanId({separator: ' ', adjectiveCount: 0}),
    [],
  );

  const user = useCurrentUser();
  const [presentUsers, setPresentUsers] = useState<LocalVoteMap>({});

  const boradcastLocalVote = (vote: number | null) => {
    const msg = {
      vote,
      // TODO:: Get real user data
      name: anonMode ? anonId : 'Corin',
      email: null,
      updatedAt: new Date(),
    } satisfies LocalVote;

    roomRef.current?.track(msg);
  };

  useEffect(() => {
    if (!roomRef.current) {
      roomRef.current = supabase.channel(roomId, {
        config: {
          presence: {
            // TODO:: Hook this up to real auth
            key: anonMode ? anonId : user?.uid,
          },
        },
      });
    }

    roomRef.current
      .on('presence', {event: 'sync'}, () => {
        const presenceState = roomRef.current!.presenceState<LocalVote>();

        const nextState = Object.keys(presenceState).reduce((acc, key) => {
          const localVote = presenceState[key].at(0);

          if (!localVote) throw new Error('Error with syncing presence state');
          acc[key] = localVote;
          return acc;
        }, {} as LocalVoteMap);

        console.log(nextState);
        setPresentUsers(nextState);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        // TODO::get inital data from server
        boradcastLocalVote(initialVote);
      });

    return () => {
      if (!roomRef.current) return;
      supabase.removeChannel(roomRef.current);
      roomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVote, roomId, user.uid]);

  return {
    presentUsers,
    broadcastVote: boradcastLocalVote,
  };
}
