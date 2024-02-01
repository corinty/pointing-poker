import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "~/db/firestore";
import { roomsRepository } from "~/db/rooms";
import { useCurrentUser } from "./useCurrentUser";

interface Room {
  activeStory: string;
}

export function useRoom(roomId: string) {
  const currentUser = useCurrentUser();
  const [room, setRoom] = useState<{ activeStory: string } | null>(null);

  const [stories, setStories] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    const unsubRoom = onSnapshot(doc(db, "rooms", roomId), {
      next: async (snapshot) => {
        if (!snapshot.exists()) {
          const room = await roomsRepository.createRoom(roomId, currentUser);

          setRoom(room.data() as Room);
        } else {
          const room = snapshot.data() as Room;

          roomsRepository.joinUser(roomId, currentUser);

          setRoom(room);
        }
      },
    });

    const unsubStories = onSnapshot(collection(db, "rooms", roomId, "stories"), {
      next: async (snapshot) => {
        const stories = Object.fromEntries(
          snapshot.docs.map((doc) => {
            if (!doc.data()) return [];
            return [doc.id, doc.data()];
          })
        );

        setStories(stories);
      },
    });

    return () => {
      unsubRoom();
      unsubRoom();
    };
  }, [roomId]);
  if (!room || !stories) return { activeStory: null, room: null, stories: null, loading: true };

  return {
    loading: false,
    activeStory: stories[room.activeStory],
    room,
    stories,
  };
}
