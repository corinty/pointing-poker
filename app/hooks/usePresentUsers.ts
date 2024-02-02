import {useEffect, useState} from 'react';
import {roomsRepository} from '~/db/rooms';
import {User} from '~/db/users';

export function usePresentUsers(roomId: string) {
  const [data, setData] = useState<User[]>();

  useEffect(() => {
    if (!roomId) return;
    const unsub = roomsRepository.subscribeToUsersInRoom(roomId, {
      next: (snapshot) => {
        const users = snapshot.docs.map((d) => {
          return {
            ...d.data(),
            uid: d.id,
          };
        });
        setData(users as User[]);
      },
    });

    return () => {
      unsub();
    };
  }, [roomId]);

  if (!data) return {loading: true};

  return {
    loading: false,
    data,
  };
}
