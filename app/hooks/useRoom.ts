import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "~/db/firestore";
import { roomsRepository } from "~/db/rooms";
import { useCurrentUser } from "./useCurrentUser";
import { User } from "firebase/auth";
import { useBeforeUnload } from "@remix-run/react";

interface Room {
  activeStory: string;
  users: User[];
}

export function useRoom(roomId: string) {
  const currentUser = useCurrentUser();
  const [room, setRoom] = useState<Room | null>(null);

  const [stories, setStories] = useState<{ [key: string]: any } | null>(null);
  if (!currentUser) throw Error("No current user");

  useBeforeUnload(
    () => {
      roomsRepository.removeUser(roomId, currentUser)
    }
  );

  useEffect(() => {
    const unsubRoom = onSnapshot(doc(db, "rooms", roomId), {
      next: async (snapshot) => {
        if (!snapshot.exists()) {
          const room = await roomsRepository.createRoom(roomId, currentUser);

          setRoom(await room as Room);
        } else {
          const room = await roomsRepository.joinUser(roomId, currentUser);

          setRoom(await room as Room);
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
      roomsRepository.removeUser(roomId, currentUser)
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
