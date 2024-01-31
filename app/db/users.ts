import { User } from "firebase/auth";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
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

export const userRepository = {
    save: save,
    list: list,
};
