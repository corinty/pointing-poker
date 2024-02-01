import { LinksFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { doc, setDoc } from "firebase/firestore";
import { Fragment, useState } from "react";
import Confetti from "react-confetti";
import { db } from "~/db/firestore";
import { useActiveStory } from "~/hooks/useActiveStory";
import { useCurrentUser } from "~/hooks/useCurrentUser";
import { usePresence } from "~/hooks/usePresence";
import { useRoom } from "~/hooks/useRoom";
import styles from "~/styles/room.css";
import { useWindowSize } from "~/utils/useWindowSize";

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

  const { loading: activeStoryLoading, data: activeStory, submitVote, currentUserVote } = useActiveStory(roomId, room?.activeStoryId);
  if (loading || !room || activeStoryLoading) return;

  const showConfetti = () => {
    setConfetti(true);
    setTimeout(() => {
      setConfetti(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col gap-2">
      <h1>Room: {roomId}</h1>
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
        {room.users.map((player) => {
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

      <button onClick={showConfetti}>Party Time</button>
      {shouldShowConfetti && <Confetti width={width} height={height} />}
    </div>
  );
}
