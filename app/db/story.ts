import {
  setDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  updateDoc,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentReference,
  DocumentSnapshot,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firestore";
import { User } from "firebase/auth";
import { userRepository } from "./users";

export interface Story {
  description: string;
  finalPoints: number;
  votes: { [key: string]: number };
}

const storyReference = (roomId: string, storyId: string) => {
  return doc(db, "rooms", roomId, "stories", storyId);
};

const loadStory = async (storyReference: DocumentReference) => {
  return getDoc(storyReference);
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
  loadStory,
  updateStory,
  storyReference,
  subscribe,
};
