import { DocumentSnapshot, query } from "firebase/firestore";
import { db } from "./firestore";
import { storyRepository } from "./story";

const subscribeToUsersInRoom = (roomId: string, { next }: { next: (snapshot: DocumentSnapshot) => void }) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("currentRoom", "==", roomId));
  return onSnapshot(storyRepository.storyReference(roomId, storyId), {
    next,
  });

  export const roomsRepository = {
    createRoom,
    joinUser,
    removeUser,
  };
};
