import { useParams } from "@remix-run/react";

export default function Room() {
  const { roomId } = useParams();
  return (
    <>
      <h1>Room: {roomId}</h1>
      <h1 className="text-3xl font-bold underline text-amber-700">Hello world!</h1>
      <p>Hello my friend</p>
      <p>What about this</p>
      what about now
    </>
  );
}
