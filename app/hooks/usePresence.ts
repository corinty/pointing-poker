import {useEffect} from 'react';
import {useBeforeUnload, useParams} from '@remix-run/react';
import {User, userRepository} from '~/db/users';

export function usePresence(currentUser: User) {
  const {roomId} = useParams();
  useBeforeUnload(() => {
    userRepository.updateUser(currentUser.uid, {
      currentRoom: null,
    });
  });

  useEffect(() => {
    if (!currentUser) return;
    userRepository.updateUser(currentUser.uid, {
      currentRoom: roomId === undefined ? null : roomId,
    });
  }, [roomId, currentUser]);
}
