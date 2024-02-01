import {
  doc, updateDoc, DocumentReference,
  DocumentSnapshot,
  onSnapshot, addDoc,
  collection
} from "firebase/firestore";
import { db } from "./firestore";

export interface Story {
  description: string;
  finalPoints: number;
  votes: { [key: string]: number };
}

const storyReference = (roomId: string, storyId: string) => {
  return doc(db, "rooms", roomId, "stories", storyId);
};

const createStory = async (roomId: DocumentReference) => {
  return addDoc(collection(roomId, "stories"), {
    description: "",
    finalPoints: -1,
    votes: {},
  });
};

const subscribe = (roomId: string, storyId: string, { next }: { next: (snapshot: DocumentSnapshot) => void }) => {
  return onSnapshot(storyRepository.storyReference(roomId, storyId), {
    next,
  });
};

const updateStory = (roomId: string, storyId: string, data: Partial<Story>) => {
  return updateDoc(storyReference(roomId, storyId), data);
};

export const storyRepository = {
  createStory,
  updateStory,
  storyReference,
  subscribe,
};
