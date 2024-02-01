import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "~/db/firestore";
import { type Room, roomsRepository } from "~/db/rooms";
import { useCurrentUser } from "./useCurrentUser";
import { useBeforeUnload } from "@remix-run/react";

export function useRoom(roomId: string) {
  const currentUser = useCurrentUser();
  const [room, setRoom] = useState<Room | null>(null);

  const [stories, setStories] = useState<{ [key: string]: any } | null>(null);
  if (!currentUser) throw Error("No current user");

  useBeforeUnload(() => {
    roomsRepository.removeUser(roomId, currentUser);
  });

  useEffect(() => {
    const unsubRoom = onSnapshot(doc(db, "rooms", roomId), {
      next: async (snapshot) => {
        if (!snapshot.exists()) {
          const room = await roomsRepository.createRoom(roomId, currentUser);

          setRoom((await room) as Room);
        } else {
          const room = await roomsRepository.joinUser(roomId, currentUser);

          setRoom((await room) as Room);
        }
      },
    }, [currentUser]);

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
      roomsRepository.removeUser(roomId, currentUser);
      unsubRoom();
      unsubRoom();
    };
  }, [roomId]);
  if (!room || !stories) return { loading: true };

  return {
    loading: false,
    room,
    stories,
  };
}
