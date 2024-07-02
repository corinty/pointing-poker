import {useEffect} from 'react';
import {supabase} from '~/db/supabase';

export function useBroadcast(roomId: string) {
  useEffect(() => {
    const channel = supabase.channel(roomId);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);
}
