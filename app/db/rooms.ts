import { setDoc, doc, getDoc, arrayUnion, arrayRemove, updateDoc, collection, where, onSnapshot, DocumentSnapshot, query, QuerySnapshot } from "firebase/firestore";
import { db } from "./firestore";
import { type User, userRepository } from "~/db/users";
import { storyRepository } from "./stories";
import { addDoc } from "firebase/firestore/lite";

export interface Room {
  activeStoryId: string;
}

const defaultRoomData = {
  activeStoryId: "",
};

export const roomReference = (roomId: string) => {
  return doc(db, "rooms", roomId);
};

const createRoom = async (roomId: string) => {
  const storySnapshot = await storyRepository.createStory(roomId);
  await setDoc(roomReference(roomId), defaultRoomData);

  updateRoom(roomId, {
    activeStoryId: storySnapshot.id,
  });

  return await getRoomData(roomId);
};

const updateRoom = (roomId: string, data: Partial<Room>) => {
  return setDoc(roomReference(roomId), data, { merge: true });
};

const getRoomData = async (roomId: string) => {
  const roomSnapshot = await getDoc(roomReference(roomId));
  if (!roomSnapshot.exists()) throw new Error(`No room found with ID: ${roomId}`);
  return roomSnapshot.data();
};
const subscribe = (roomId: string, { next }: { next: (snapshot: DocumentSnapshot) => void }) => {
  return onSnapshot(roomReference(roomId), { next });
};

const subscribeToUsersInRoom = (roomId: string, { next }: { next: (snapshot: QuerySnapshot) => void }) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("currentRoom", "==", roomId));

  return onSnapshot(q, { next });
};

export const roomsRepository = {
  subscribeToUsersInRoom,
  subscribe,
  getRoomData,
  createRoom,
  updateRoom,
};
