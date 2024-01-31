import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

import { useParams } from "@remix-run/react";

export default function Room() {
  const { roomId } = useParams();
  return (
    <div className="flex flex-col gap-8">
      <h1>Room: {roomId}</h1>
      <h1 className="text-3xl font-bold underline text-amber-700">Hello world!</h1>
      <p>Hello my friend</p>
      <p>What about this</p>
      <Input />
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components and dependencies to your app using the cli.</AlertDescription>
      </Alert>
    </div>
  );
}
