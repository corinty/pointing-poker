import { collection, doc } from "firebase/firestore";
import { useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import { db } from "~/db/firestore";


export function useRoom(roomId:string) {
  const [roomData, roomLoading, error] = useDocumentData(doc(db, "rooms", roomId));
  const [stories, storiesLoading] = useCollectionData(collection(db, `rooms/${roomId}/stories`));

  return {
    ...roomData,
   stories
 }


}
