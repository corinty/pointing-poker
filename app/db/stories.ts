import { doc, getDoc, updateDoc, DocumentReference, DocumentSnapshot, onSnapshot, addDoc, collection, setDoc } from "firebase/firestore";
import { db } from "./firestore";
import { roomReference, roomsRepository } from "./rooms";

export interface Story {
  description: string;
  finalPoints: number | null;
  displayVotes: boolean;
  votes: { [key: string]: number };
}
const defaultStory: Story = {
  description: "",
  finalPoints: null,
  displayVotes: false,
  votes: {},
};

const storyReference = (roomId: string, storyId: string) => {
  return doc(db, "rooms", roomId, "stories", storyId);
};

const createStory = async (roomId: string, { setActive: active }: { setActive?: boolean } = {}) => {
  const docRef = await addDoc(collection(roomReference(roomId), "stories"), defaultStory);
  const storySnapshot = await getDoc(docRef);

  if (active) {
    roomsRepository.updateRoom(roomId, { activeStoryId: storySnapshot.id });
  }

  return storySnapshot;
};

const clearVotes = (roomId: string, storyId: string) => {
  return updateStory(roomId, storyId, {
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
  clearVotes,
  storyReference,
  subscribe,
};
