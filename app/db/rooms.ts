import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "./firestore";

const roomReference = (roomId: string) => {
    return doc(db, "rooms", roomId);
}

const loadRoom = (roomId: string) => {
    return getDoc(roomReference(roomId));
}

const createRoom = (roomId: string) => {
    setDoc(doc(db, "rooms", roomId), {
        users: [],
        activeStoryId: '',
        stories: [],
    });

    return loadRoom(roomId);
};

export const roomsRepository = {
    createRoom: createRoom,
};
