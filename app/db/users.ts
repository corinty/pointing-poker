import { User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, getDocs, collection, getDoc, DocumentReference } from "firebase/firestore";
import { db } from "~/db/firestore";

export interface User {
    name: string;
    email: string;
    photoURL: string;
    uid: string;
}

const save = (firebaseUser: FirebaseUser) => {
    const user = fromFirebaseToUser(firebaseUser);
    setDoc(doc(db, "users", firebaseUser.uid), user);
};

const fromFirebaseToUser = (firebaseUser: FirebaseUser): User => {
    return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "",
    };
}

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
    fromFirebaseToUser,
    list,
};
