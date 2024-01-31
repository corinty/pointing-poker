import { useParams } from "@remix-run/react";
import { useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "~/utils/useWindowSize";
import styles from "~/styles/room.css";
import { LinksFunction } from "@remix-run/node";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, "?"];

export default function Room() {
  const { roomId } = useParams();
  const { width, height } = useWindowSize();
  const [shouldShowConfetti, setConfetti] = useState(false);

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
      <textarea>Story Title</textarea>
      <div className="pointSubmissions">
        {pointValues.map((value) => (
          <button key={value} onClick={() => handleSubmission(value)}>
            {value}
          </button>
        ))}
      </div>
      <button onClick={showConfetti}>Party Time</button>

      {shouldShowConfetti && <Confetti width={width} height={height} />}
    </div>
  );
}
