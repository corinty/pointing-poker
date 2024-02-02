import {User as FirebaseUser} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDocs,
  collection,
  getDoc,
  DocumentReference,
  updateDoc,
  where,
  query,
} from 'firebase/firestore';
import {db} from '~/db/firestore';

export interface User {
  name: string;
  email: string;
  photoURL: string;
  uid: string;
  currentRoom?: string | null;
}

const save = (firebaseUser: FirebaseUser) => {
  const user = fromFirebaseToUser(firebaseUser);
  setDoc(doc(db, 'users', firebaseUser.uid), user, {merge: true});
};

const fromFirebaseToUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
  };
};

const list = () => {
  return getDocs(collection(db, 'users'));
};

const loadFromReference = async (userReference: DocumentReference) => {
  const userSnapshot = await getDoc(userReference);

  return {
    ...userSnapshot.data(),
    uid: userSnapshot.id,
  };
};

const getReference = (userId: string) => {
  return doc(db, 'users', userId);
};

const updateUser = (userId: string, data: Partial<User>) => {
  updateDoc(getReference(userId), data);
};

const usersInRoom = async (roomId: string) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('currentRoom', '==', roomId));
  return (await getDocs(q)).docs;
};

const usersInRoomData = async (roomId: string) => {
  return (await usersInRoom(roomId)).map((s) => s.data());
};

export const userRepository = {
  save,
  getReference,
  loadFromReference,
  fromFirebaseToUser,
  updateUser,
  list,
  usersInRoom,
  usersInRoomData,
};
