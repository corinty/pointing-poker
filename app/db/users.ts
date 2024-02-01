import { User } from "firebase/auth";
import { doc, setDoc, getDocs, collection, getDoc, DocumentReference } from "firebase/firestore";
import { db } from '~/db/firestore';

const save = (user: User) => {
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
    return (await getDoc(userReference)).data();
}

const getReference = (userId: string) => {
    return doc(db, "users", userId);
};

export const userRepository = {
    save,
    getReference,
    loadFromReference,
    list,
};
