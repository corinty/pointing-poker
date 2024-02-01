import { setDoc, doc, getDoc, arrayUnion, arrayRemove, updateDoc, QueryDocumentSnapshot, SnapshotOptions, DocumentReference } from "firebase/firestore";
import { db } from "./firestore";
import { type User, userRepository } from "~/db/users";

export interface Room {
  activeStoryId: string;
  users: User[];
}

const roomReference = (roomId: string) => {
  return doc(db, "rooms", roomId);
};

const loadRoom = async (roomId: string) => {
  const roomSnapshot = await getDoc(roomReference(roomId));
  if (!roomSnapshot.exists()) return;
  const users = await Promise.all(
    roomSnapshot.data().users.map((userRef: DocumentReference) => {
      return userRepository.loadFromReference(userRef);
    })
  );
  return {
    ...roomSnapshot.data(),
    users,
  };
};

const createRoom = async (roomId: string, user: User) => {
  const userReference = userRepository.getReference(user.uid);
  setDoc(doc(db, "rooms", roomId), {
    users: [userReference],
    activeStoryId: "",
    stories: [],
  });

  return await loadRoom(roomId);
};

const joinUser = async (roomId: string, user: User) => {
  const userReference = userRepository.getReference(user.uid);

  updateDoc(roomReference(roomId), { users: arrayUnion(userReference) });

  return await loadRoom(roomId);
};

const removeUser = (roomId: string, user: User) => {
  const userReference = userRepository.getReference(user.uid);

  updateDoc(roomReference(roomId), { users: arrayRemove(userReference) });
};

export const roomsRepository = {
  createRoom,
  joinUser,
  removeUser,
};
