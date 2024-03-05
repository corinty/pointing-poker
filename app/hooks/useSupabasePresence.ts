import {RealtimeChannel} from '@supabase/supabase-js';
import {useEffect, useRef} from 'react';
import {supabase} from '~/db/supabase';

interface PresenceOptions {
  key?: string;
  sync?: (channel: RealtimeChannel) => void;
  onConnect?: (channel: RealtimeChannel) => void;
}
export function useSupabasePresence(
  channel: string,
  {sync, onConnect, key}: PresenceOptions,
) {
  const roomRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomRef.current) {
      roomRef.current = supabase.channel(channel, {
        config: {
          presence: {
            key,
          },
        },
      });
    }

    roomRef.current
      .on('presence', {event: 'sync'}, () => {
        sync?.(roomRef.current!);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        onConnect?.(roomRef.current!);
      });

    return () => {
      if (!roomRef.current) return;
      supabase.removeChannel(roomRef.current);
      roomRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, sync, onConnect]);

  return roomRef.current;
}
