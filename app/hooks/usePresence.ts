import { getDatabase, ref, set, onValue, onDisconnect } from "firebase/database";
import { useCurrentUser } from "./useCurrentUser";
import { db, app } from "~/db/firestore";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useEffect } from "react";
import { useBeforeUnload, useParams } from "@remix-run/react";
import { userRepository } from "~/db/users";

export function usePresence(currentUser) {
  const { roomId } = useParams();
  useBeforeUnload(() => {
    userRepository.updateUser(currentUser.uid, {
      currentRoom: null,
    });
  });

  useEffect(() => {
    if (!currentUser) return;
    userRepository.updateUser(currentUser.uid, {
      currentRoom: roomId === undefined ? null : roomId,
    });
  }, [roomId, currentUser]);
}
