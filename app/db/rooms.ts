import { setDoc, doc, getDoc, arrayUnion, arrayRemove, updateDoc, DocumentReference, collection, getDocs } from "firebase/firestore";
import { db } from "./firestore";
import { type User, userRepository } from "~/db/users";
import { storyRepository } from "./story";

export interface Room {
    activeStoryId: string;
    users: User[];
}

const roomReference = (roomId: string) => {
    return doc(db, "rooms", roomId);
};

const loadRoom = async (roomId: string) => {
    const roomSnapshot = await getDoc(roomReference(roomId));
    if (!roomSnapshot.exists()) return;
    const users = await Promise.all(
        roomSnapshot.data().users.map((userRef: DocumentReference) => {
            return userRepository.loadFromReference(userRef);
        })
    );
    return {
        ...roomSnapshot.data(),
        users,
    };
};

const createRoom = async (roomId: string, user: User) => {
    const userReference = userRepository.getReference(user.uid);
    await setDoc(doc(db, "rooms", roomId), {
        users: [userReference],
        activeStoryId: ""
    });
    const room = await loadRoom(roomId);

    await storyRepository.createStory(roomReference(roomId));
    const storySnapshot = await getDocs(collection(db, "rooms", roomId, "stories"));
    const activeStoryId = storySnapshot.docs[0].id;
    setDoc(roomReference(roomId), { activeStoryId }, { merge: true });

    return {
        ...room,
        activeStoryId
    };
};

const joinUser = async (roomId: string, user: User) => {
    const userReference = userRepository.getReference(user.uid);

    updateDoc(roomReference(roomId), { users: arrayUnion(userReference) });

    return await loadRoom(roomId);
};

const removeUser = (roomId: string, user: User) => {
    const userReference = userRepository.getReference(user.uid);

    updateDoc(roomReference(roomId), { users: arrayRemove(userReference) });
};

export const roomsRepository = {
    createRoom,
    joinUser,
    removeUser,
};
