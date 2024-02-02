import {
  doc,
  getDoc,
  updateDoc,
  DocumentSnapshot,
  onSnapshot,
  addDoc,
  collection,
  QuerySnapshot,
} from 'firebase/firestore';
import {db} from './firestore';
import {roomReference, roomsRepository} from './rooms';

export interface Story {
  description: string;
  finalPoints: number | null;
  displayVotes: boolean;
  votes: {[key: string]: {value: number; submitedAt: Date}};
}
const defaultStory: Story = {
  description: '',
  finalPoints: null,
  displayVotes: false,
  votes: {},
};

const storyReference = (roomId: string, storyId: string) => {
  return doc(db, 'rooms', roomId, 'stories', storyId);
};
const storyCollectionReference = (roomId: string) => {
  return collection(db, 'rooms', roomId, 'stories');
};

const createStory = async (
  roomId: string,
  {setActive: active}: {setActive?: boolean} = {},
) => {
  const docRef = await addDoc(
    collection(roomReference(roomId), 'stories'),
    defaultStory,
  );
  const storySnapshot = await getDoc(docRef);

  if (active) {
    roomsRepository.updateRoom(roomId, {activeStoryId: storySnapshot.id});
  }

  return storySnapshot;
};

const clearVotes = (roomId: string, storyId: string) => {
  return updateStory(roomId, storyId, {
    votes: {},
  });
};

const subscribe = (
  roomId: string,
  storyId: string,
  {next}: {next: (snapshot: DocumentSnapshot) => void},
) => {
  return onSnapshot(storyRepository.storyReference(roomId, storyId), {
    next,
  });
};
const subscribeToCollection = (
  roomId: string,
  {next}: {next: (snapshot: QuerySnapshot) => void},
) => {
  return onSnapshot(storyCollectionReference(roomId), {
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
  subscribeToCollection,
};
