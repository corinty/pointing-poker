import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "~/db/firestore";
import { type Room, roomsRepository } from "~/db/rooms";
import { useCurrentUser } from "./useCurrentUser";

export function useRoom(roomId: string) {
  const currentUser = useCurrentUser();
  const [room, setRoom] = useState<Room | null>(null);

  const [stories, setStories] = useState<{ [key: string]: any } | null>(null);
  if (!currentUser) throw Error("No current user");

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
      unsubStories();
    };
  }, [roomId]);
  if (!room || !stories) return { loading: true };

  return {
    loading: false,
    room,
    stories,
  };
}
