import {useEffect, useState} from 'react';
import {type Room, roomsRepository} from '~/db/rooms';
import {useCurrentUser} from './useCurrentUser';
import {Story, storyRepository} from '~/db/stories';

export function useRoom(roomId: string) {
  const currentUser = useCurrentUser();
  const [room, setRoom] = useState<Room | null>(null);

  const [stories, setStories] = useState<{[key: string]: Story} | null>(null);
  if (!currentUser) throw Error('No current user');

  useEffect(() => {
    const unsubRoom = roomsRepository.subscribe(roomId, {
      next: async (snapshot) => {
        if (!snapshot.exists()) {
          const newRoomSnapshot = await roomsRepository.createRoom(roomId);
          setRoom(newRoomSnapshot.data() as Room);
        } else {
          setRoom(snapshot.data() as Room);
        }
      },
    });

    const unsubStories = storyRepository.subscribeToCollection(roomId, {
      next: async (snapshot) => {
        const stories = snapshot.docs.reduce((acc, doc) => {
          if (!doc.exists()) return acc;

          acc[doc.id] = doc.data() as Story;

          return acc;
        }, {} as {[key: string]: Story});

        setStories(stories);
      },
    });

    return () => {
      unsubRoom();
      unsubStories();
    };
  }, [roomId]);
  if (!room || !stories) return {loading: true};

  return {
    loading: false,
    room,
    stories,
  };
}
