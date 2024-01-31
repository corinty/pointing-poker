import { userRepository } from "~/db/users";
import { getAuth, signInWithPopup, GithubAuthProvider, User } from "firebase/auth";

import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import { Form, redirect, useNavigate } from "@remix-run/react";
import { humanId } from "human-id";
import styles from "~/styles/home.css";
import { useState } from "react";

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
  }).catch((error) => {
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
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  getAuth().onAuthStateChanged(function(user) {
    if (user) {
      setUser(user);
    }
  });

  return (
    <div>
      <h1>♣️ Welcome to Pointing Poker</h1>
      <section>
        <Form className="room-selection" action="POST">
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
          <input name="join-room-code" pattern="^[a-z\-]*$" required />
          <button type="submit">Join Room</button>
        </Form>
      </section>
    </div>
  );
}
