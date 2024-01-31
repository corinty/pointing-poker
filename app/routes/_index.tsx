import { userRepository } from "~/db/users";
import { getAuth, signInWithPopup, GithubAuthProvider, User } from "firebase/auth";

import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import { Form, redirect, useNavigate } from "@remix-run/react";
import { humanId } from "human-id";
import styles from "~/styles/home.css";
import { useState } from "react";
import { initializeFirestore } from "~/db/firestore";

const signIn = (setUser) => {
  const provider = new GithubAuthProvider();
  const auth = getAuth();

  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // The signed-in user info.
      const user = result.user;

      setUser(user);
      userRepository.save(user);
    })
    .catch((error) => {
      // Handle Errors here.

      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GithubAuthProvider.credentialFromError(error);
      console.log("error", error, errorCode, errorMessage, email, credential);
      // ...
    });
};

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const roomCode = formData.get("join-room-code");

  return redirect(`/room/${roomCode}`);
};

export default function Index() {
  initializeFirestore();
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  getAuth().onAuthStateChanged(function (user) {
    if (user) {
      setUser(user);
    }
  });

  return (
    <div>
      <h1>♣️ Welcome to Pointing Poker</h1>
      <section>
        <div className="room-selection">
          <div></div>
          <button
            onClick={() => {
              // generate room code
              const roomCode = humanId({
                separator: "-",
                capitalize: false,
              });
              // navigate to the room
              navigate(`/room/${roomCode}`);
            }}
          >
            Create Room
          </button>
          <Form className="flex col-span-2 gap-4" method="post">
            <input name="join-room-code" className="w-1/2" pattern="^[a-z\-]*$" required />
            <button type="submit" className="w-1/2">
              Join Room
            </button>
          </Form>
        </div>
      </section>
    </div>
  );
}
