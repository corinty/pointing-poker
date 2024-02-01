import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firestore";
import { User } from "firebase/auth";
import { userRepository } from "./users";

const roomReference = (roomId: string) => {
    return doc(db, "rooms", roomId);
}

const loadRoom = (roomId: string) => {
    return getDoc(roomReference(roomId));
}

const createRoom = (roomId: string, user: User) => {
    const userReference = userRepository.getReference(user.uid);
    setDoc(doc(db, "rooms", roomId), {
        users: [userReference],
        activeStoryId: '',
        stories: [],
    });

    return loadRoom(roomId);
};

export const roomsRepository = {
    createRoom: createRoom,
};
