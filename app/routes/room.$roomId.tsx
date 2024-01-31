import { useParams } from "@remix-run/react";
import { Fragment, useState } from "react";
import { useCollection, useCollectionData, useDocument, useDocumentData } from "react-firebase-hooks/firestore";
import Confetti from "react-confetti";
import { useWindowSize } from "~/utils/useWindowSize";
import styles from "~/styles/room.css";
import { LinksFunction } from "@remix-run/node";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "~/db/firestore";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, "?"];
const tempPlayers = ["Tina", "Alex", "Aram"];

export default function Room() {
  const { roomId } = useParams();
  const { width, height } = useWindowSize();
  const [shouldShowConfetti, setConfetti] = useState(false);

  if (!roomId) throw Error("missing param");


  const showConfetti = () => {
    setConfetti(true);
    setTimeout(() => {
      setConfetti(false);
    }, 5000);
  };

  const handleSubmission = (value: number | string) => {
    console.log(value);
  };

  return (
    <div className="flex flex-col gap-2">
      <h1>Room: {roomId}</h1>
      <div>
        <h3>Issue Title</h3>
        <textarea defaultValue={"Story Title"} />
      </div>
      <hr />
      <div className="points">
        {pointValues.map((value) => (
          <button key={value} onClick={() => handleSubmission(value)}>
            {value}
          </button>
        ))}
      </div>

      <div className="submissions">
        <p className="text-2xl font-bold">Player</p>
        <p className="text-2xl font-bold">Points</p>
        {tempPlayers.map((player) => (
          <Fragment key={player}>
            <div>{player}</div>
            <div>{Math.random()}</div>
          </Fragment>
        ))}
      </div>

      <button onClick={showConfetti}>Party Time</button>
      {shouldShowConfetti && <Confetti width={width} height={height} />}
    </div>
  );
}
