import { LinksFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { doc, setDoc } from "firebase/firestore";
import { Fragment, useEffect, useState } from "react";
import Confetti from "react-confetti";
import CopyCurrentUrlToClipboard from "~/components/CopyCurrentUrlToClipboard";
import { db } from "~/db/firestore";
import { useActiveStory } from "~/hooks/useActiveStory";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { usePresence } from "~/hooks/usePresence";
import { usePresentUsers } from "~/hooks/usePresentUsers";
import { useRoom } from "~/hooks/useRoom";
import styles from "~/styles/room.css";
import { useWindowSize } from "~/utils/useWindowSize";
import _ from "lodash";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

export default function Room() {
  const { roomId } = useParams();
  const { width, height } = useWindowSize();
  const [shouldShowConfetti, setConfetti] = useState(false);
  const currentUser = useCurrentUser();

  // TODO: Redirect to login page
  if (!currentUser) throw Error("Must be logged In");
  if (!roomId) throw Error("missing param");

  const { room, stories, loading } = useRoom(roomId);

  const { data: usersData, loading: usersLoading } = usePresentUsers(roomId);
  const { loading: activeStoryLoading, data: activeStory, submitVote, currentUserVote } = useActiveStory(roomId, room?.activeStoryId);

  useEffect(() => {
    if (!activeStory) return;
    const votes = Object.values(activeStory.votes);
    const hasConsensus = votes.every((vote) => vote == votes[0]);

    if (hasConsensus) setConfetti(hasConsensus);
  }, [activeStory]);
  if (loading || !room || !activeStory || usersLoading) return;

  return (
    <div className="flex flex-col gap-2">
      <h1>Room: {roomId}</h1>
      <CopyCurrentUrlToClipboard />
      <div>
        <h3>Issue:</h3>
        <textarea
          value={activeStory?.description || ""}
          onChange={async (e) => {
            const value = e.target.value;
            setDoc(doc(db, `rooms/${roomId}/stories/${room.activeStoryId}`), { description: value }, { merge: true });
          }}
        />
      </div>
      <hr />
      <div className="points">
        {pointValues.map((value) => (
          <button key={value} className={value == currentUserVote ? "bg-green-500" : ""} onClick={() => submitVote(currentUser.uid, value)}>
            {value}
          </button>
        ))}
      </div>

      <div className="submissions">
        <p className="text-2xl font-bold">Person</p>
        <p className="text-2xl font-bold">Points</p>
        {usersData!.map((player) => {
          return (
            <Fragment key={player.name}>
              <div className="player text-center">
                <div>{player.name || player.email}</div>
                <div>
                  <img src={player.photoURL} />
                </div>
              </div>
              <div className="text-9xl">{activeStory?.votes[player.uid]}</div>
            </Fragment>
          );
        })}
      </div>

      {shouldShowConfetti && <Confetti width={width} height={height} />}
    </div>
  );
}
