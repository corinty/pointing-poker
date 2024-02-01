import { User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, getDocs, collection, getDoc, DocumentReference } from "firebase/firestore";
import { db } from "~/db/firestore";

export interface User {
  name: string;
  email: string;
  photoURL: string;
  uid: string;
}

const save = (user: FirebaseUser) => {
  setDoc(doc(db, "users", user.uid), {
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  });
};

const list = () => {
  return getDocs(collection(db, "users"));
};

const loadFromReference = async (userReference: DocumentReference) => {
  const userSnapshot = await getDoc(userReference);

  return {
    ...userSnapshot.data(),
    uid: userSnapshot.id,
  };
};

const getReference = (userId: string) => {
  return doc(db, "users", userId);
};

export const userRepository = {
  save,
  getReference,
  loadFromReference,
  list,
};
